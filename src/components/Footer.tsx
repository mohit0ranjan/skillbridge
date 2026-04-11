import Link from "next/link";

function BridgeLogoFooter() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-7 h-7"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="url(#footer-grad)" />
      <path
        d="M9 24Q20 10 31 24"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="10.5" y="23" width="2.8" height="8" rx="1" fill="#fff" />
      <rect x="26.7" y="23" width="2.8" height="8" rx="1" fill="#fff" />
      <line
        x1="9"
        y1="27"
        x2="31"
        y2="27"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.65"
      />
      <defs>
        <linearGradient id="footer-grad" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="var(--color-brand-light)" />
          <stop offset="1" stopColor="var(--color-brand)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-14 pb-8 px-6">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          <div className="max-w-[280px]">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-[24px] leading-none font-bold tracking-tight text-foreground mb-3"
            >
              <BridgeLogoFooter />
              Skill<span className="text-brand">Bridge</span>
            </Link>
            <p className="text-[13px] text-muted leading-relaxed mt-3">
              Virtual internships for college students who want to start early,
              build proof of work, and earn a verified certificate.
            </p>
          </div>

          <div className="flex flex-wrap gap-12 md:gap-16">
            <div>
              <h4 className="text-[13px] font-semibold text-foreground mb-4">
                Platform
              </h4>
              <ul className="space-y-3 text-[13px] text-muted">
                <li>
                  <Link
                    href="/programs"
                    className="hover:text-gray-700 transition-colors"
                  >
                    Internships
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="hover:text-gray-700 transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#pricing"
                    className="hover:text-gray-700 transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/verify-certificate"
                    className="hover:text-gray-700 transition-colors"
                  >
                    Verify Certificate
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-foreground mb-4">
                Company
              </h4>
              <ul className="space-y-3 text-[13px] text-muted">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-gray-700 transition-colors"
                  >
                    About SkillBridge
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-gray-700 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-gray-700 transition-colors"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-foreground mb-4">
                Support
              </h4>
              <ul className="space-y-3 text-[13px] text-muted">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-gray-700 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund"
                    className="hover:text-gray-700 transition-colors"
                  >
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:hello@skillbridge.in"
                    className="hover:text-gray-700 transition-colors"
                  >
                    hello@skillbridge.in
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-3 text-[12px] text-muted">
          <p>
            &copy; {new Date().getFullYear()} SkillBridge Technologies Pvt. Ltd.
          </p>
          <div className="flex gap-5">
            <a
              href="https://x.com/skillbridgehq"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-500 transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://linkedin.com/company/skillbridgehq"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-500 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://instagram.com/skillbridgehq"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-500 transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
