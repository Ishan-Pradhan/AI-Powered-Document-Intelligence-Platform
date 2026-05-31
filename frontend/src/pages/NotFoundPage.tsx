import { useNavigate } from "react-router-dom"

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-6">

      {/* faint background watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute select-none font-black text-foreground/[0.03]"
        style={{ fontSize: "clamp(180px, 40vw, 520px)", lineHeight: 1, userSelect: "none" }}
      >
        404
      </span>

      {/* main content */}
      <div className="relative z-10 flex max-w-md flex-col gap-6">
        {/* eyebrow */}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">
          Error 404
        </p>

        {/* headline */}
        <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl">
          This page<br />
          doesn&apos;t exist.
        </h1>

        {/* divider */}
        <div className="h-px w-12 bg-primary-500" />

        {/* body */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          You might have followed a broken link, or the page was moved.
          Either way, there&apos;s nothing here.
        </p>

        {/* actions */}
        <div className="flex items-center gap-4">
          <button
            id="not-found-go-back"
            onClick={() => navigate(-1)}
            className="h-10 rounded-md border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            ← Go back
          </button>
          <button
            id="not-found-go-home"
            onClick={() => navigate("/")}
            className="h-10 rounded-md bg-primary-500 px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Take me home
          </button>
        </div>
      </div>

      {/* bottom-right stamp */}
      <p
        aria-hidden
        className="absolute bottom-6 right-6 select-none text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40"
      >
        AI Document Intelligence
      </p>
    </div>
  )
}

export default NotFoundPage
