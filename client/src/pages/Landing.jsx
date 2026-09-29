import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../assets/espi-logo-black.png";
import heroImg from "../assets/hero.png";
import house1Img from "../assets/house1.avif";
import house2Img from "../assets/house2.avif";
import house3Img from "../assets/house3.avif";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

/* ------------------------------------------------------------------ */
/* Content — swap these for real data / API results later              */
/* ------------------------------------------------------------------ */

const IMAGES = {
  logo: logoImg,
  hero: heroImg,
};

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Properties", href: "#properties" },
  { label: "Faq", href: "#faq" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

const STATS = [
  { value: "+120", unit: "h", label: "Saved on home searches" },
  { value: "+95", unit: "%", label: "Client satisfaction rate" },
  { value: "+30", unit: "%", label: "Fastest sales than average" },
  { value: "+120", unit: "%", label: "Clients return or refer friends" },
];

const PROPERTIES = [
  {
    id: 1,
    name: "Rufina Ready-For-Occupancy",
    address: "Parian, San Fernando City, La Union",
    type: "3BR Townhouse",
    price: "PHP 7,700,000.00",
    image: house1Img,
    isNew: true,
  },
  {
    id: 2,
    name: "Poro Ready-For-Occupancy",
    address: "Poro, San Fernando City, La Union",
    type: "3BR Townhouse",
    price: "PHP 7,000,000.00",
    image: house2Img,
  },
  {
    id: 3,
    name: "Rufina Ready-For-Occupancy",
    address: "Parian, San Fernando City, La Union",
    type: "3BR Townhouse",
    price: "PHP 7,700,000.00",
    image: house3Img,
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    quote: "Made buying our first home effortless",
    name: "Mr. and Mrs John Doe",
    role: "First time home-buyers",
  },
  {
    id: 2,
    quote: "Made buying our first home effortless",
    name: "Mr. and Mrs John Doe",
    role: "First time home-buyers",
  },
  {
    id: 3,
    quote: "Made buying our first home effortless",
    name: "Mr. and Mrs John Doe",
    role: "First time home-buyers",
  },
];

const FAQS = [
  {
    q: "How do I start Buying a home?",
    a: "Start by assessing your budget, getting pre-approved for a mortgage, and working with a trusted agent to find properties that match your needs.",
  },
  {
    q: "How much do I need for a down payment?",
    a: "Answer coming soon.",
  },
  {
    q: "What is the home selling process?",
    a: "Answer coming soon.",
  },
  {
    q: "Do I need a real estate agent?",
    a: "Answer coming soon.",
  },
  {
    q: "What cost should I expect besides the listing price?",
    a: "Answer coming soon.",
  },
];

const LOCATIONS = ["Bagiuo City", "San Fernando City", "Baguio City"];

const TYPES = ["House and Lot", "Townhouse", "Condominium", "Lot Only"];

const PRICES = [
  "1,000,000.00 PHP",
  "3,000,000.00 PHP",
  "5,000,000.00 PHP",
  "10,000,000.00 PHP",
];

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Heading({ children, className = "" }) {
  return (
    <h2
      className={`font-serif uppercase text-brand-dark leading-tight text-3xl md:text-5xl ${className}`}
    >
      {children}
    </h2>
  );
}

function CarouselArrows({ onPrev, onNext }) {
  const btn =
    "w-12 h-12 rounded-full bg-[#F3E6DA] text-brand-dark text-xl flex items-center justify-center hover:bg-[#EBDDD2] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark";

  return (
    <div className="flex justify-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous"
        className={btn}
      >
        ←
      </button>

      <button type="button" onClick={onNext} aria-label="Next" className={btn}>
        →
      </button>
    </div>
  );
}

/*
 * FIX:
 * The ref is only accessed inside the event handlers.
 * We return the ref and handlers separately instead of accessing
 * propertyScroller.prev / propertyScroller.next during render.
 */
function useScroller() {
  const ref = useRef(null);

  const prev = () => {
    const el = ref.current;

    if (!el) return;

    el.scrollBy({
      left: -(el.clientWidth * 0.8),
      behavior: "smooth",
    });
  };

  const next = () => {
    const el = ref.current;

    if (!el) return;

    el.scrollBy({
      left: el.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return [ref, prev, next];
}

const fieldBase =
  "w-full bg-transparent text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer";

function SearchField({ label, value, onChange, options }) {
  return (
    <label className="flex-1 min-w-40">
      <span className="block text-xs font-semibold text-brand-dark mb-1">
        {label}
      </span>

      <span className="flex items-center bg-[#F6F1EA] rounded-md px-3 py-2.5">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={fieldBase}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>

        <span aria-hidden="true" className="text-gray-500 text-xs ml-2">
          ⌄
        </span>
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Landing() {
  const navigate = useNavigate();

  const [search, setSearch] = useState({
    location: LOCATIONS[0],
    type: TYPES[0],
    price: PRICES[0],
  });

  const [openFaq, setOpenFaq] = useState(0);

  const [contact, setContact] = useState({
    fullname: "",
    email: "",
    details: "",
  });

  /*
   * FIX:
   * Destructure the ref and functions instead of accessing
   * .prev/.next properties from an object during render.
   */
  const [propertyScrollerRef, propertyPrev, propertyNext] = useScroller();

  const [testimonialScrollerRef, testimonialPrev, testimonialNext] =
    useScroller();

  const handleSearch = (e) => {
    e.preventDefault();

    navigate(`/properties?${new URLSearchParams(search).toString()}`);
  };

  const handleContact = (e) => {
    e.preventDefault();

    // TODO: wire to backend inquiry endpoint.
    console.log("Inquiry submitted", contact);
  };

  const inputClass =
    "w-full border border-gray-200 bg-white rounded-md px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/30";

  return (
    <div id="home" className="min-h-screen bg-brand-cream text-brand-dark">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 md:pt-8 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4">
        <a href="#home" aria-label="Estate Site Properties Inc.">
          <img
            src={IMAGES.logo}
            alt="Estate Site Properties Inc."
            className="h-24 sm:h-32 md:h-48 lg:h-56 w-auto"
          />
        </a>

        <nav
          aria-label="Main"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-5 md:gap-x-6 text-sm sm:text-base text-gray-600"
        >
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-brand-dark">
              {l.label}
            </a>
          ))}

          <Link to="/register" className="hover:text-brand-dark">
            Register
          </Link>

          <Link to="/login" className="hover:text-brand-dark">
            Login
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section id="about" className="max-w-6xl mx-auto px-6 mt-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1 className="font-serif uppercase text-3xl md:text-4xl leading-snug max-w-md">
            Turning property into opportunity
          </h1>

          <div className="max-w-xs text-xs">
            <p className="uppercase mb-1">Top rated realtors</p>

            <p className="text-gray-700">
              Discover properties tailored to you lifestyle, from cozy
              apartments to luxury estates
            </p>
          </div>
        </div>

        <div className="relative mt-8 rounded-3xl overflow-hidden bg-[#D9CBB8]">
          <img
            src={IMAGES.hero}
            alt="Modern home on a hillside"
            className="w-full h-72 md:h-105"
          />

          <form
            onSubmit={handleSearch}
            className="absolute left-1/2 -translate-x-1/2 bottom-3 w-[93%] bg-brand-cream rounded-t-2xl p-4 md:p-6 flex flex-wrap items-end gap-4"
          >
            <SearchField
              label="Location"
              value={search.location}
              onChange={(v) =>
                setSearch({
                  ...search,
                  location: v,
                })
              }
              options={LOCATIONS}
            />

            <SearchField
              label="Type"
              value={search.type}
              onChange={(v) =>
                setSearch({
                  ...search,
                  type: v,
                })
              }
              options={TYPES}
            />

            <SearchField
              label="Price"
              value={search.price}
              onChange={(v) =>
                setSearch({
                  ...search,
                  price: v,
                })
              }
              options={PRICES}
            />

            <button
              type="submit"
              className="bg-brand-dark text-white text-sm font-medium px-5 py-3 rounded-md hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-dark"
            >
              Search Property
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-[#F8EEE4] rounded-md p-5 h-44 flex flex-col justify-between"
          >
            <p className="text-4xl">
              {s.value}
              <span className="text-base">{s.unit}</span>
            </p>

            <p className="text-sm text-gray-700">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Properties */}
      <section id="properties" className="max-w-6xl mx-auto px-6 mt-28">
        <Heading className="text-center max-w-2xl mx-auto">
          Discover the collection of our most desirable homes
        </Heading>

        <div className="mt-8">
          <CarouselArrows onPrev={propertyPrev} onNext={propertyNext} />
        </div>

        <div
          ref={propertyScrollerRef}
          className="mt-10 flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-none] [&::-webkit-scrollbar]:hidden"
        >
          {PROPERTIES.map((p) => (
            <article
              key={p.id}
              className="relative snap-start shrink-0 w-[85%] sm:w-[45%] lg:w-[32%] h-72 rounded-md overflow-hidden bg-[#D9CBB8]"
            >
              <img
                src={p.image}
                alt={p.name}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {p.isNew && (
                <span className="absolute top-3 left-3 bg-white text-xs px-3 py-1.5 rounded-md">
                  New on market
                </span>
              )}

              <div className="absolute left-3 right-3 bottom-3 bg-white rounded-md p-3 flex justify-between gap-3 text-[11px]">
                <div>
                  <p className="font-medium">{p.name}</p>

                  <p className="text-gray-600">{p.address}</p>

                  <p className="text-gray-600">{p.type}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-gray-500">Investment Price:</p>

                  <p>{p.price}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="blog" className="max-w-6xl mx-auto px-6 mt-32">
        <div className="text-center">
          <p className="text-sm uppercase mb-1">Testimonials</p>

          <Heading>What our client saying</Heading>
        </div>

        <div className="mt-8">
          <CarouselArrows onPrev={testimonialPrev} onNext={testimonialNext} />
        </div>

        <div
          ref={testimonialScrollerRef}
          className="mt-10 flex gap-8 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-none] [&::-webkit-scrollbar]:hidden"
        >
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.id}
              className="snap-start shrink-0 w-[85%] sm:w-[45%] lg:w-[31%] h-72 bg-[#F8EEE4] rounded-md p-5 flex flex-col justify-between shadow-sm"
            >
              <div
                className="w-6 h-6 rounded-full bg-brand-dark/80"
                aria-hidden="true"
              />

              <blockquote className="text-center text-sm">
                “{t.quote}”
              </blockquote>

              <figcaption className="text-sm">
                <p>{t.name}</p>

                <p className="text-gray-500">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="max-w-6xl mx-auto px-6 mt-36 grid md:grid-cols-2 gap-10"
      >
        <div>
          <p className="text-sm mb-1">FAQ</p>

          <Heading>Clear answers to common question</Heading>
        </div>

        <div>
          {FAQS.map((f, i) => {
            const open = openFaq === i;

            return (
              <div
                key={f.q}
                className="border-b border-gray-300 py-3 first:pt-0"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? -1 : i)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 text-left text-sm"
                >
                  {f.q}

                  <span
                    aria-hidden="true"
                    className={`transition-transform ${
                      open ? "" : "rotate-180"
                    }`}
                  >
                    ⌃
                  </span>
                </button>

                {open && (
                  <p className="mt-2 text-xs text-gray-700 max-w-sm">{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact + footer */}
      <section id="contact" className="mt-28">
        <div className="max-w-6xl mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-10 items-start">
          <div className="pt-8">
            <p className="text-sm mb-1">CONTACT US</p>

            <Heading>Ready to discuss your ideas</Heading>

            <p className="mt-4 text-sm text-gray-700 max-w-md">
              Feel free to reach out the way it works best for you. Our team
              will properly take care of your ideas, and help you through the
              process.
            </p>
          </div>

          <form
            onSubmit={handleContact}
            className="bg-brand-cream rounded-md shadow-lg p-6 md:p-8 space-y-5"
          >
            <label className="block">
              <span className="block text-sm uppercase mb-1">Fullname</span>

              <input
                type="text"
                required
                value={contact.fullname}
                onChange={(e) =>
                  setContact({
                    ...contact,
                    fullname: e.target.value,
                  })
                }
                placeholder="How can we approach you"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="block text-sm uppercase mb-1">Email</span>

              <input
                type="email"
                required
                value={contact.email}
                onChange={(e) =>
                  setContact({
                    ...contact,
                    email: e.target.value,
                  })
                }
                placeholder="We will reach you back using it"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="block text-sm uppercase mb-1">Details</span>

              <textarea
                rows={4}
                value={contact.details}
                onChange={(e) =>
                  setContact({
                    ...contact,
                    details: e.target.value,
                  })
                }
                placeholder="Provide as much details as possible"
                className={inputClass}
              />
            </label>

            <button
              type="submit"
              className="w-full bg-gray-600 text-white text-sm py-3 rounded-md hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark"
            >
              Send
            </button>
          </form>
        </div>

        <footer className="bg-[#EBDDD2] -mt-40 pt-48 md:-mt-52 md:pt-60 pb-10">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 text-sm">
            <div className="space-y-6">
              <p className="flex items-start gap-3">
                <FontAwesomeIcon icon={faEnvelope} className="mt-1" />

                <span>estatesitepropertiesinc@gmail.com</span>
              </p>

              <p className="flex items-start gap-3">
                <FontAwesomeIcon icon={faPhone} className="mt-1" />

                <span>
                  +63 905 341 4016
                  <br />
                  +63 917 522 5759
                </span>
              </p>

              <p className="flex items-start gap-3 max-w-xs text-gray-700">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="mt-1 shrink-0"
                />

                <span>
                  C1G Back Summer Pines Residences, 288 Marcos Highway, Imelda
                  Marcos, Baguio City 2600
                  <br />
                  <br />
                  3rd Floor Brimea Building, 21 Quezon Avenue, Catbangen, San
                  Fernando City, La Union 2500
                </span>
              </p>

              <img
                src={IMAGES.logo}
                alt="Estate Site Properties Inc."
                className="h-24 w-auto"
              />
            </div>

            <nav
              aria-label="Footer"
              className="flex flex-wrap items-end justify-start md:justify-end gap-x-4 text-xs"
            >
              <a href="#about">About</a>
              <a href="#properties">Properties</a>
              <a href="#faq">FAQ</a>
              <a href="#blog">Blog</a>
              <a href="#contact">Contact</a>
            </nav>
          </div>
        </footer>
      </section>
    </div>
  );
}
