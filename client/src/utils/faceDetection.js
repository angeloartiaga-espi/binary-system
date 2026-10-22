// Everything that talks to face-api lives in this file, so the camera
// component stays easy to read.

// Where the model files are served from (they live in client/public/models).
// BASE_URL is "/" in development and in a normal deployment.
export const MODEL_URL = `${import.meta.env.BASE_URL}models`;

// ---- Settings you can tune ------------------------------------------------
export const DETECTION_INTERVAL_MS = 250; // look for faces 4 times a second
export const MIN_FACE_WIDTH_RATIO = 0.15; // a face narrower than 15% of the picture is ignored (too far away)
const INPUT_SIZE = 320; // smaller = faster, bigger = more accurate (multiple of 32)
const SCORE_THRESHOLD = 0.5; // how sure the detector must be that it is a face

// The library + model files are downloaded once and then reused. If the
// download fails we forget the failure, so "Try again" really tries again.
let loading = null;

export function loadFaceModels() {
  if (!loading) {
    loading = (async () => {
      // A dynamic import: the (large) library is only downloaded when someone
      // actually opens the registration camera, not for every page.
      const faceapi = await import("@vladmandic/face-api");
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      return faceapi;
    })().catch((err) => {
      loading = null;
      throw err;
    });
  }
  return loading;
}

// Looks at the current video frame and returns a list of detected faces.
export async function detectFaces(videoElement) {
  const faceapi = await loadFaceModels();
  return faceapi.detectAllFaces(
    videoElement,
    new faceapi.TinyFaceDetectorOptions({
      inputSize: INPUT_SIZE,
      scoreThreshold: SCORE_THRESHOLD,
    }),
  );
}

// The "exactly one face" rule. Faces that are too small (far away, or a
// poster in the background) are ignored. `tooSmall` lets the screen say
// "move closer" instead of the confusing "no face detected".
export function countUsableFaces(detections, frameWidth) {
  const usable = detections.filter(
    (detection) => detection.box.width / frameWidth >= MIN_FACE_WIDTH_RATIO,
  );
  return {
    count: usable.length,
    tooSmall: usable.length === 0 && detections.length > 0,
  };
}
