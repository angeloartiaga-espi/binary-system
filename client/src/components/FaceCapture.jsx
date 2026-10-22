import { useCallback, useEffect, useRef, useState } from "react";
import {
  DETECTION_INTERVAL_MS,
  countUsableFaces,
  detectFaces,
  loadFaceModels,
} from "../utils/faceDetection";

const MAX_PHOTO_SIDE = 1024;
const JPEG_QUALITY = 0.9;
const MAX_DETECTION_FAILURES = 5;

// Converts browser camera errors into user-friendly messages.
function describeCameraError(err) {
  switch (err?.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Camera permission was blocked. Allow camera access for this site in your browser settings, then press Try again.";

    case "NotFoundError":
    case "DevicesNotFoundError":
    case "OverconstrainedError":
      return "No camera was found on this device.";

    case "NotReadableError":
    case "TrackStartError":
      return "The camera is being used by another app or browser tab. Close it, then press Try again.";

    case "SecurityError":
      return "The browser blocked the camera for security reasons. Make sure this page is opened with https://.";

    default:
      return "The camera could not be started. Please try again.";
  }
}

function cameraUnavailableMessage() {
  if (typeof window !== "undefined" && window.isSecureContext === false) {
    return "Camera access needs a secure connection. Open this site with https:// (not http://).";
  }

  return "This browser does not support camera access. Please use an up-to-date Chrome, Safari, Edge or Firefox.";
}

// Determines the status message displayed below the camera.
function describeStatus({ hasPhoto, models, camera, cameraError, faces }) {
  if (hasPhoto) {
    return {
      tone: "ok",
      text: "Photo captured. Press Retake Photo if you want a different one.",
    };
  }

  if (models === "error") {
    return {
      tone: "error",
      text: "Face detection could not be loaded. Check your internet connection, then press Try again.",
    };
  }

  if (camera === "error") {
    return { tone: "error", text: cameraError };
  }

  if (camera === "starting") {
    return { tone: "info", text: "Starting camera…" };
  }

  if (camera === "live") {
    if (models === "loading") {
      return {
        tone: "info",
        text: "Loading face detection… this only takes a moment the first time.",
      };
    }

    if (faces.count > 1) {
      return {
        tone: "warn",
        text: "More than one face detected. Only you should be in the picture.",
      };
    }

    if (faces.count === 1) {
      return {
        tone: "ok",
        text: "Face detected. You can capture your photo now.",
      };
    }

    if (faces.tooSmall) {
      return {
        tone: "warn",
        text: "Move a little closer to the camera.",
      };
    }

    return {
      tone: "info",
      text: "No face detected. Look straight at the camera in good light.",
    };
  }

  if (models === "loading") {
    return { tone: "info", text: "Loading face detection…" };
  }

  return {
    tone: "info",
    text: "Press Start camera, then look straight at the camera.",
  };
}

const TONE_CLASS = {
  ok: "text-green-700",
  info: "text-gray-600",
  warn: "text-amber-700",
  error: "text-red-600",
};

export default function FaceCapture({ onChange, disabled = false }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(false);
  const startingRef = useRef(false);
  const photoUrlRef = useRef(null);

  const [models, setModels] = useState("loading");
  const [camera, setCamera] = useState("idle");
  const [cameraError, setCameraError] = useState(null);
  const [faces, setFaces] = useState({
    count: 0,
    tooSmall: false,
  });
  const [capturing, setCapturing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [captureMessage, setCaptureMessage] = useState(null);

  // Stops the camera and releases its resources.
  const stopCamera = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Releases the captured photo's temporary URL.
  const revokePhoto = useCallback(() => {
    if (photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = null;
    }
  }, []);

  // Loads the face detection models.
  // Used by the Retry button. Do not synchronously set
  // the loading state here because it is also called by an effect.
  const loadModels = useCallback(() => {
    loadFaceModels()
      .then(() => {
        if (mountedRef.current) {
          setModels("ready");
        }
      })
      .catch(() => {
        if (!mountedRef.current) return;

        stopCamera();
        setCamera("idle");
        setModels("error");
      });
  }, [stopCamera]);

  // Load models when the component mounts.
  useEffect(() => {
    mountedRef.current = true;

    loadFaceModels()
      .then(() => {
        if (mountedRef.current) {
          setModels("ready");
        }
      })
      .catch(() => {
        if (!mountedRef.current) return;

        stopCamera();
        setCamera("idle");
        setModels("error");
      });

    return () => {
      mountedRef.current = false;
      stopCamera();
      revokePhoto();
    };
  }, [stopCamera, revokePhoto]);

  // Starts the camera after the user clicks Start camera.
  const startCamera = useCallback(async () => {
    if (startingRef.current) return;

    setCameraError(null);
    setCaptureMessage(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera("error");
      setCameraError(cameraUnavailableMessage());
      return;
    }

    startingRef.current = true;
    setCamera("starting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        if (mountedRef.current && streamRef.current === stream) {
          stopCamera();
          setCamera("error");
          setCameraError(
            "The camera was disconnected. Reconnect it, then press Try again.",
          );
        }
      });

      setFaces({ count: 0, tooSmall: false });
      setCamera("live");
    } catch (err) {
      if (mountedRef.current) {
        setCamera("error");
        setCameraError(describeCameraError(err));
      }
    } finally {
      startingRef.current = false;
    }
  }, [stopCamera]);

  // Detect faces while the camera is running.
  useEffect(() => {
    if (camera !== "live") return undefined;

    const video = videoRef.current;
    const stream = streamRef.current;

    if (!video || !stream) return undefined;

    video.srcObject = stream;
    video.play().catch(() => {});

    let cancelled = false;
    let failures = 0;

    const tick = async () => {
      if (cancelled) return;

      if (video.readyState >= 2 && video.videoWidth > 0) {
        try {
          const detections = await detectFaces(video);

          failures = 0;

          if (cancelled) return;

          const next = countUsableFaces(detections, video.videoWidth);

          setFaces((prev) =>
            prev.count === next.count && prev.tooSmall === next.tooSmall
              ? prev
              : next,
          );
        } catch {
          failures += 1;

          if (failures >= MAX_DETECTION_FAILURES && !cancelled) {
            stopCamera();
            setCamera("error");
            setCameraError("Face detection stopped working. Press Try again.");
            return;
          }
        }
      }

      if (!cancelled) {
        timerRef.current = setTimeout(tick, DETECTION_INTERVAL_MS);
      }
    };

    tick();

    return () => {
      cancelled = true;
      clearTimeout(timerRef.current);
    };
  }, [camera, stopCamera]);

  // Captures a photo only when exactly one usable face is detected.
  const handleCapture = async () => {
    const video = videoRef.current;

    if (!video || capturing) return;

    setCapturing(true);
    setCaptureMessage(null);

    try {
      const detections = await detectFaces(video);

      const check = countUsableFaces(detections, video.videoWidth);

      if (check.count !== 1) {
        setFaces(check);
        setCaptureMessage(
          "We need exactly one face in the picture. Please try again.",
        );
        return;
      }

      const scale = Math.min(
        1,
        MAX_PHOTO_SIDE / Math.max(video.videoWidth, video.videoHeight),
      );

      const canvas = document.createElement("canvas");

      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not access the image canvas.");
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
      });

      if (!blob) {
        throw new Error("Could not create the image.");
      }

      const file = new File([blob], `face-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      stopCamera();

      const url = URL.createObjectURL(file);

      revokePhoto();
      photoUrlRef.current = url;

      setPhotoUrl(url);
      setCamera("idle");
      setFaces({ count: 0, tooSmall: false });

      onChange?.(file);
    } catch {
      setCaptureMessage("The photo could not be captured. Please try again.");
    } finally {
      if (mountedRef.current) {
        setCapturing(false);
      }
    }
  };

  // Clears the current photo and restarts the camera.
  const handleRetake = () => {
    revokePhoto();
    setPhotoUrl(null);
    setCaptureMessage(null);

    onChange?.(null);
    startCamera();
  };

  const hasPhoto = Boolean(photoUrl);
  const live = camera === "live";

  const canCapture =
    live && models === "ready" && faces.count === 1 && !capturing && !disabled;

  const status = describeStatus({
    hasPhoto,
    models,
    camera,
    cameraError,
    faces,
  });

  const ringClass =
    live && faces.count === 1
      ? "ring-green-500"
      : live && faces.count > 1
        ? "ring-amber-500"
        : "ring-gray-300";

  return (
    <div
      className="rounded-md border border-gray-300 bg-white p-3"
      data-testid="face-capture"
    >
      <div
        className={`relative mx-auto aspect-4/3 w-full max-w-sm overflow-hidden rounded-md bg-black ring-4 ${ringClass}`}
      >
        {hasPhoto ? (
          <img
            src={photoUrl}
            alt="Your captured face photo"
            className="h-full w-full object-contain"
            data-testid="face-preview"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              data-testid="face-video"
              className={`h-full w-full object-cover ${live ? "" : "hidden"}`}
              style={{ transform: "scaleX(-1)" }}
            />

            {!live && (
              <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-gray-300">
                {camera === "starting" ? "Starting camera…" : "Camera is off"}
              </div>
            )}
          </>
        )}
      </div>

      <p
        role="status"
        aria-live="polite"
        data-testid="face-status"
        className={`mt-3 text-center text-sm font-medium ${TONE_CLASS[status.tone]}`}
      >
        {status.text}
      </p>

      {captureMessage && (
        <p
          className="mt-1 text-center text-sm text-red-600"
          data-testid="face-capture-message"
        >
          {captureMessage}
        </p>
      )}

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {models === "error" && (
          <button
            type="button"
            onClick={loadModels}
            data-testid="face-retry-models"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Try again
          </button>
        )}

        {models !== "error" && !hasPhoto && !live && camera !== "starting" && (
          <button
            type="button"
            onClick={startCamera}
            disabled={disabled}
            data-testid="face-start"
            className="rounded-md bg-brand-dark px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {camera === "error" ? "Try again" : "Start camera"}
          </button>
        )}

        {live && (
          <button
            type="button"
            onClick={handleCapture}
            disabled={!canCapture}
            data-testid="face-capture-btn"
            className="rounded-md bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {capturing ? "Capturing…" : "Capture Photo"}
          </button>
        )}

        {hasPhoto && (
          <button
            type="button"
            onClick={handleRetake}
            disabled={disabled}
            data-testid="face-retake"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            Retake Photo
          </button>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-gray-500">
        Face detection runs on your own device. Only the photo you capture is
        uploaded, when you submit the form.
      </p>
    </div>
  );
}
