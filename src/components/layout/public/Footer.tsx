import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#0d0c0d] border-t border-white/[0.08] text-white">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-16 border-b border-white/[0.08]">
          {/* Brand info */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-block" aria-label="CoderPad">
              <svg
                className="h-[27px] w-auto"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 152 27"
                fill="none"
              >
                <title>CoderPad</title>
                <path
                  fill="#ffffff"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="m47.042 22.669-.282.115q-1.176.48-2.298.717-1.115.237-2.315.236c-1.28 0-2.43-.188-3.447-.576l-.004-.002a6.76 6.76 0 0 1-2.576-1.771l-.002-.003c-.697-.784-1.222-1.745-1.58-2.874l-.002-.004c-.35-1.14-.52-2.445-.52-3.912 0-1.506.189-2.858.575-4.052.384-1.197.938-2.22 1.668-3.055a7.1 7.1 0 0 1 2.65-1.92c1.044-.445 2.205-.663 3.475-.663q.601 0 1.127.027.546.028 1.068.11.519.07 1.05.195a12 12 0 0 1 1.106.318l.307.104v4.302l-.64-.305a9.7 9.7 0 0 0-2.037-.728 8 8 0 0 0-1.745-.216c-.761 0-1.384.14-1.885.403l-.003.001-.002.001c-.512.26-.933.627-1.267 1.11-.33.478-.582 1.063-.746 1.764v.002a10 10 0 0 0-.251 2.335q0 1.37.25 2.427c.172.69.43 1.259.766 1.719q.495.678 1.273 1.044c.516.234 1.147.36 1.905.36q.391 0 .86-.074.491-.09.985-.218.504-.14.983-.32.5-.195.92-.389l.634-.292zm14.998-3.43q-.475 1.403-1.381 2.426a6.16 6.16 0 0 1-2.225 1.583c-.88.374-1.87.556-2.962.556-1.035 0-1.974-.153-2.813-.469a5.64 5.64 0 0 1-2.155-1.42l-.003-.003c-.593-.64-1.04-1.43-1.348-2.355-.308-.938-.457-2.012-.457-3.214q-.002-1.68.471-3.084l.002-.004q.486-1.4 1.394-2.41l.002-.003a6.2 6.2 0 0 1 2.236-1.552c.878-.373 1.858-.555 2.934-.555 1.043 0 1.988.157 2.828.483a5.6 5.6 0 0 1 2.155 1.435c.595.642 1.037 1.431 1.336 2.356.308.92.457 1.971.457 3.147 0 1.11-.155 2.14-.471 3.082m-4.468-5.893-.002-.002c-.418-.575-1.039-.883-1.94-.883-.504 0-.903.1-1.216.277a2.3 2.3 0 0 0-.817.773l-.002.004q-.332.494-.5 1.196a7.2 7.2 0 0 0-.16 1.552c0 1.363.272 2.312.744 2.92.468.592 1.101.895 1.95.895.474 0 .863-.094 1.18-.265q.492-.278.798-.754c.214-.342.38-.75.493-1.233a7 7 0 0 0 .172-1.59c0-1.36-.257-2.298-.698-2.887zm30.618 6.802a16.5 16.5 0 0 0 2.253-.493l.572-.166v3.537l-.327.094q-.533.152-1.154.275-.616.122-1.258.218-.647.096-1.308.137-.66.054-1.282.054-1.591.002-2.888-.467a5.9 5.9 0 0 1-2.217-1.401l-.003-.003c-.611-.63-1.074-1.4-1.392-2.3-.319-.905-.473-1.938-.473-3.09 0-1.144.154-2.195.47-3.146.314-.956.762-1.784 1.348-2.475a5.9 5.9 0 0 1 2.131-1.614c.845-.385 1.776-.573 2.787-.573.993 0 1.89.158 2.68.487a5.4 5.4 0 0 1 1.99 1.352q.804.876 1.213 2.069a7.9 7.9 0 0 1 .407 2.579q0 .348-.027.884-.013.543-.054 1.023l-.035.417h-8.73q.05.535.21.949.244.59.651.982a3 3 0 0 0 1.025.598q.617.214 1.394.216.939 0 2.017-.143m-.782-6.625v-.003a2.3 2.3 0 0 0-.48-.824l-.002-.003-.003-.003a1.75 1.75 0 0 0-.672-.458l-.004-.002a2.3 2.3 0 0 0-.863-.156c-.695 0-1.236.232-1.661.686l-.003.003c-.346.363-.595.865-.725 1.536h4.57a3 3 0 0 0-.157-.776m33.712.317-.001.001a5.9 5.9 0 0 1-1.438 2.153c-.64.61-1.429 1.077-2.356 1.406-.935.332-2.004.493-3.2.493h-1.196v5.604h-4.16V5.145h5.487q1.718-.002 3.069.39c.905.254 1.681.634 2.315 1.15a4.94 4.94 0 0 1 1.459 1.92c.337.753.499 1.605.499 2.547q.001 1.44-.478 2.688m-4.007-3.55-.002-.007a1.94 1.94 0 0 0-.534-.791l-.003-.003-.002-.002a2.5 2.5 0 0 0-.937-.516c-.393-.125-.876-.193-1.458-.193h-1.248v5.481h1.354c.52 0 .963-.07 1.335-.2a2.5 2.5 0 0 0 .912-.574l.002-.002.003-.003q.373-.364.562-.885l.002-.004.001-.004q.204-.522.206-1.208a2.9 2.9 0 0 0-.191-1.084zm14.919 13.207-.054-1.203q-.094.083-.191.164l-.003.003-.003.002q-.499.405-1.092.706-.605.306-1.309.463a6.3 6.3 0 0 1-1.523.172c-.727 0-1.385-.108-1.965-.338a4.1 4.1 0 0 1-1.46-.96 4.1 4.1 0 0 1-.904-1.484l-.001-.004-.001-.003a5.7 5.7 0 0 1-.287-1.857q-.001-1.06.44-1.975l.002-.003.001-.003a4.3 4.3 0 0 1 1.364-1.566l.002-.002c.605-.428 1.339-.754 2.193-.987h.001c.871-.236 1.876-.35 3.009-.35h1.301v-.358c0-.304-.043-.563-.119-.782l-.002-.004a1.2 1.2 0 0 0-.345-.527l-.003-.003-.004-.003c-.15-.14-.363-.262-.657-.354-.286-.09-.659-.14-1.131-.14q-1.13 0-2.237.268h-.004a11.4 11.4 0 0 0-2.139.733l-.633.29V9.775l.283-.114q1.006-.404 2.288-.664a13.7 13.7 0 0 1 2.705-.262c1.017 0 1.908.1 2.667.309.758.199 1.403.509 1.92.942.525.433.913.979 1.159 1.629.244.633.359 1.358.359 2.166v9.716zm-.48-5.991h-1.511c-.518 0-.935.05-1.261.143-.337.095-.586.22-.765.361a1.3 1.3 0 0 0-.393.483 1.4 1.4 0 0 0-.118.585c0 .444.135.725.36.915.248.2.614.325 1.151.325.335 0 .713-.123 1.144-.417q.62-.421 1.393-1.22zM72.603 22.32l.156-.153.052 1.33h3.656V3.731h-4.108V8.92l-.4-.061a8 8 0 0 0-1.058-.07q-1.552-.002-2.893.463a6.1 6.1 0 0 0-2.351 1.438c-.667.648-1.183 1.463-1.554 2.432v.002c-.367.972-.543 2.106-.543 3.392q-.002 1.61.343 2.945c.23.887.566 1.66 1.014 2.308l.002.003.002.003a4.85 4.85 0 0 0 1.71 1.498c.686.358 1.46.531 2.31.531a5 5 0 0 0 1.41-.19q.642-.174 1.205-.496l.004-.002.003-.002a6 6 0 0 0 1.04-.795m-.816-9.972h.002q.325.055.57.123v5.445c-.508.7-.98 1.243-1.415 1.637-.427.386-.842.551-1.253.551-.304 0-.56-.061-.776-.174-.206-.114-.395-.299-.56-.576-.16-.282-.295-.66-.394-1.15q-.136-.744-.136-1.835.001-1.001.22-1.77v-.001c.145-.525.347-.951.596-1.289.26-.34.563-.596.912-.777.342-.177.735-.27 1.19-.27q.529 0 1.044.086m74.918 10.066q.079-.075.156-.152l.052 1.33h3.656V3.824h-4.107v5.19l-.401-.062a8 8 0 0 0-1.058-.07q-1.552-.001-2.893.464a6.1 6.1 0 0 0-2.351 1.438c-.667.648-1.183 1.463-1.554 2.432l-.001.002c-.366.972-.542 2.106-.542 3.392q-.001 1.61.344 2.945c.23.887.565 1.66 1.013 2.308l.002.003.003.003a4.84 4.84 0 0 0 1.71 1.498c.686.358 1.459.531 2.31.531q.761.001 1.41-.19.643-.175 1.204-.496l.004-.002.004-.002a6 6 0 0 0 1.039-.795m-.815-9.97q.325.053.571.122v5.445q-.763 1.048-1.416 1.637c-.427.386-.842.551-1.253.551a1.66 1.66 0 0 1-.776-.174c-.205-.114-.394-.299-.561-.577-.159-.281-.294-.66-.392-1.148q-.136-.746-.137-1.836.001-1.002.22-1.77v-.001c.146-.525.347-.951.596-1.289q.388-.508.912-.777c.342-.178.736-.27 1.191-.27q.528 0 1.044.086m-42.85 2.334c-.046-.4-.078-.597-.139-1.002-.108-.724-.443-1.443-1.267-1.443-.618 0-.932.269-1.521.752-.473.389-.954 1.012-1.377 1.551v8.706H94.55V8.872h3.778l.073 1.217.042-.043.005-.005q.46-.452 1.007-.774a4.8 4.8 0 0 1 1.247-.515 5.8 5.8 0 0 1 1.466-.174c.726 0 1.386.129 1.971.4a3.73 3.73 0 0 1 1.487 1.177c.406.523.693 1.168.871 1.918q.208.83.237 1.83c-.869.2-3.318.808-3.694.872"
                />
                <path
                  fill="#d91629"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.847.814a4.78 4.78 0 0 0-4.78 4.78v16.44a4.78 4.78 0 0 0 4.78 4.78h16.44a4.78 4.78 0 0 0 4.78-4.78V5.595a4.78 4.78 0 0 0-4.78-4.78z"
                />
                <path
                  fill="#ffffff"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.535 9.41h-2.131l-2.88 8.809h2.11zm-5.847 2.424v-2.4l-6.195 3.288v2.184l6.195 3.288V15.93l-3.91-2.135zm12.953.888-6.23-3.287v2.4l3.978 1.96-3.978 2.134v2.264l6.23-3.287z"
                />
              </svg>
            </Link>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              The premier live coding interview and automated technical
              screening platform. Filter candidates based on verified
              engineering skills in 99+ languages.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="size-2 rounded-full bg-[#37c773] animate-pulse" />
              <span className="font-mono text-xs text-neutral-400">
                All platform systems operational
              </span>
            </div>
          </div>

          {/* Product links */}
          <div className="space-y-3">
            <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-300">
              Platform
            </h5>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link
                  href="/register"
                  className="hover:text-white transition-colors"
                >
                  Screen (Assessments)
                </Link>
              </li>
              <li>
                <Link
                  href="/company-registration"
                  className="hover:text-white transition-colors"
                >
                  Interview (Live IDE)
                </Link>
              </li>
              <li>
                <Link
                  href="/company-registration"
                  className="hover:text-white transition-colors"
                >
                  Qualify (Pre-screens)
                </Link>
              </li>
              <li>
                <Link
                  href="/company-registration"
                  className="hover:text-white transition-colors"
                >
                  Map (Skill Analytics)
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div className="space-y-3">
            <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-300">
              Solutions
            </h5>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link
                  href="/register"
                  className="hover:text-white transition-colors"
                >
                  AI Fluency Screening
                </Link>
              </li>
              <li>
                <Link
                  href="/company-registration"
                  className="hover:text-white transition-colors"
                >
                  High-Volume Hiring
                </Link>
              </li>
              <li>
                <Link
                  href="/company-registration"
                  className="hover:text-white transition-colors"
                >
                  University Recruiting
                </Link>
              </li>
              <li>
                <Link
                  href="/company-registration"
                  className="hover:text-white transition-colors"
                >
                  Anti-Cheating Guard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-300">
              Resources
            </h5>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link
                  href="/register"
                  className="hover:text-white transition-colors"
                >
                  Sandbox Playground
                </Link>
              </li>
              <li>
                <Link
                  href="/company-registration"
                  className="hover:text-white transition-colors"
                >
                  Question Bank
                </Link>
              </li>
              <li>
                <a
                  href="https://coderpad.io/blog/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Engineering Blog
                </a>
              </li>
              <li>
                <Link
                  href="/company-registration"
                  className="hover:text-white transition-colors"
                >
                  Customer Case Studies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <p>© 2026 CoderPad, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/company-registration"
              className="hover:text-neutral-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/company-registration"
              className="hover:text-neutral-300 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/company-registration"
              className="hover:text-neutral-300 transition-colors"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
