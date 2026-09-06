const INFO_CARDS = [
  {
    title: "What We Do",
    description:
      "We connect people to donation drives happening in their community, providing a simple and organized way to see ongoing initiatives. By bringing these drives together in one place, we make it easier for anyone to find opportunities to help and support causes they care about.",
  },
  {
    title: "Our Goal",
    description:
      "Our goal is to make giving simple, accessible, and meaningful for everyone. We want to ensure that anyone who wants to help can easily discover donation drives, understand what is needed, and contribute in ways that make a real difference.",
  },
  {
    title: "Why It Matters",
    description:
      "Every donation counts, no matter the size. By showcasing drives in one organized platform, we help ensure that more people and communities receive the support they need, while encouraging a culture of giving and compassion.",
  },
];

export function AboutSection() {
  return (
    <section className="bg-accent py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="text-center text-3xl font-bold lg:text-4xl">Connect. Discover. Make a Difference.</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 rounded-2xl bg-white p-8 text-gray-900 shadow-xl md:grid-cols-3">
          {INFO_CARDS.map((card, i) => (
            <div
              key={card.title}
              className={`p-4 ${i !== INFO_CARDS.length - 1 ? "border-b border-gray-200 md:border-b-0 md:border-r" : ""}`}
            >
              <h3 className="text-lg font-bold">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}