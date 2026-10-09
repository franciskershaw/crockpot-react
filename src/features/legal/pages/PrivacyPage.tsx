import { type ReactNode } from "react";
import { CONTACT_EMAIL } from "@/lib/contact";

export function PrivacyPage() {
  return (
    <div className="px-5 pt-6 pb-10 md:px-6 md:pt-14 md:pb-16">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="mb-2 font-display text-[27px] leading-tight font-medium md:text-[34px]">
          Privacy
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Last updated 9 October 2026
        </p>

        <div className="space-y-8">
          <Section title="Who runs Crockpot">
            <p>
              Crockpot is run by myself, Francis Kershaw, a solo developer based
              in the UK. For anything about your data, email <ContactLink />.
            </p>
          </Section>

          <Section title="What we store">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Your account: name, email address, and either your password
                (stored as a one-way hash, never in plain text) or your Google
                account ID. Also when you signed up, when you last signed in,
                and whether you've verified your email.
              </li>
              <li>
                What you do in Crockpot: recipes and photos you add, your
                favourites, your menu and how often you've added each recipe to
                it, your shopping list and your regular items.
              </li>
              <li>
                Sign-in tokens that keep you signed in, and the links we email
                for verification and password resets. These are stored hashed
                and expire.
              </li>
            </ul>
            <p>
              If you sign in with Google, we only ask Google for your name,
              email address and account ID.
            </p>
            <p>
              Our server sees your IP address, as every website does. Crockpot
              uses it to limit how many requests can be made and doesn't save
              it, though our hosting providers' server logs record it for a
              short time.
            </p>
          </Section>

          <Section title="Why we store it">
            <p>
              To run the service you signed up for: your account, menu, lists
              and recipes. We email you only to verify your address or reset
              your password. No marketing, no selling your data, no ads.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              One cookie, which keeps you signed in. It's essential to the site
              working, so there's no cookie banner. No analytics or tracking
              cookies.
            </p>
          </Section>

          <Section title="Recipes you publish">
            <p>
              Once a recipe you've added is approved, anyone can see it, with
              your name on it.
            </p>
          </Section>

          <Section title="Who else handles your data">
            <p>
              A few services store or process data on our behalf. Some of them
              are outside the UK and use standard legal safeguards for
              international transfers.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Neon: the database</li>
              <li>Cloudinary: recipe photos</li>
              <li>Resend: verification and password-reset emails</li>
              <li>Google: sign-in, if you choose it</li>
              <li>Vercel: hosts this website</li>
            </ul>
          </Section>

          <Section title="How long we keep it, and deleting it">
            <p>
              We keep your data while you have an account. You can delete your
              account at any time from Account settings. That permanently
              removes your account, menu, shopping list, favourites, regular
              items and any recipes that haven't been approved. Approved recipes
              stay on Crockpot, without your name.
            </p>
          </Section>

          <Section title="Your rights">
            <p>
              Under UK data protection law you can ask for a copy of your data,
              ask us to correct or delete it, or object to how we use it. Email{" "}
              <ContactLink />. If you're unhappy with our answer, you can
              complain to the Information Commissioner's Office (ico.org.uk).
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl md:text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function ContactLink() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="underline underline-offset-3"
    >
      {CONTACT_EMAIL}
    </a>
  );
}
