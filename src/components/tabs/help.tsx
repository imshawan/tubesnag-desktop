import { faqs } from "@/constants";
import { Download, Zap, HelpCircle, Shield, ChevronDown } from "lucide-react";
import ExternalLink from "@/components/external-link";

interface HelpProps {}

export function Help({}: HelpProps) {
  return (
    <>
      <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
        <div className="text-center space-y-2 mb-4">
          <div className="flex items-center justify-center gap-3">
            <HelpCircle className="size-8 text-primary" />
            <h1 className="text-3xl font-bold">Help & Documentation</h1>
          </div>
          <p className="text-muted-foreground">
            Learn how to use TubeSnag and get answers to common questions.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Key Features</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <Download className="mb-3 size-6 text-primary" />
              <h3 className="mb-1 font-semibold">Multiple Modes</h3>
              <p className="text-sm text-muted-foreground">
                Download single videos, bulk URLs, or playlists.
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <Zap className="mb-3 size-6 text-primary" />
              <h3 className="mb-1 font-semibold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                High-speed concurrent downloads.
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <Shield className="mb-3 size-6 text-primary" />
              <h3 className="mb-1 font-semibold">100% Private</h3>
              <p className="text-sm text-muted-foreground">
                No tracking, no data collection.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group rounded-xl border border-border/50 bg-card/50 px-5 py-3 transition-all hover:bg-card/80 open:bg-card open:shadow-sm"
              >
                <summary className="flex cursor-pointer items-center justify-between font-medium outline-none">
                  {faq.question}
                  <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed animate-in slide-in-from-top-2">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-primary/5 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need more help? Check out the{" "}
            <ExternalLink
              href="https://github.com/imshawan/tubesnag-desktop"
              className="font-medium text-primary hover:underline"
            >
              GitHub repository
            </ExternalLink>{" "}
            for additional resources.
          </p>
        </div>
      </div>
    </>
  );
}
