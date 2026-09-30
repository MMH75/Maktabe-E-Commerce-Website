export default function ContactUsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
        <div className="space-y-6 pt-2">
          <h1 className="font-heading text-5xl font-bold text-crimson">
            Contact Us
          </h1>

          <div className="space-y-4 text-[1rem] leading-8 text-ink sm:text-[1.05rem]">
            <p className="font-medium">Shahid Nadeem</p>
            <p>Manager</p>
            <p>Maktaba Khuddam ul Quran</p>
            <p>Quran Academy</p>
            <p>36-K, Model Town, Lahore, Punjab</p>
            <p>Pakistan</p>
            <p>Email: maktaba@tanzeem.org</p>
            <p>Whatsapp: 03011115348</p>
          </div>
        </div>

        <div className="w-full">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-base font-medium text-ink sm:text-lg">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="h-12 w-full border border-cream-deep bg-white px-3 text-base outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="mb-2 block text-base font-medium text-ink sm:text-lg">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="h-12 w-full border border-cream-deep bg-white px-3 text-base outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="mb-2 block text-base font-medium text-ink sm:text-lg">
                Subject
              </label>
              <input
                type="text"
                className="h-12 w-full border border-cream-deep bg-white px-3 text-base outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-base font-medium text-ink sm:text-lg">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={12}
              className="w-full resize-none border border-cream-deep bg-white p-3 text-base outline-none focus:border-gold"
            />
          </div>

          <div className="mt-5 flex items-center justify-end">
            <span className="text-sm font-medium text-red-500">* Required Fields</span>
          </div>

          <div className="mt-6">
            <button className="w-full rounded-full bg-navy px-6 py-4 text-center text-xl font-bold tracking-[0.08em] text-white shadow-md transition hover:bg-gold sm:text-2xl">
              SEND MESSAGE
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
