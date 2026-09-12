import { Heart, Search, Users } from "lucide-react";

const INFO_CARDS = [
  {
    icon: Search,
    title: "What We Do",
    description:
      "We connect people to donation drives happening in their community, providing a simple and organized way to see ongoing initiatives. By bringing these drives together in one place, we make it easier for anyone to find opportunities to help and support causes they care about.",
  },
  {
    icon: Users,
    title: "Our Goal",
    description:
      "Our goal is to make giving simple, accessible, and meaningful for everyone. We want to ensure that anyone who wants to help can easily discover donation drives, understand what is needed, and contribute in ways that make a real difference.",
  },
  {
    icon: Heart,
    title: "Why It Matters",
    description:
      "Every donation counts, no matter the size. By showcasing drives in one organized platform, we help ensure that more people and communities receive the support they need, while encouraging a culture of giving and compassion.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="relative flex min-h-[85vh] lg:min-h-[92vh] flex-col justify-center bg-blue-600 py-24 text-white scroll-mt-16">
      <div className="mx-auto my-auto w-full max-w-7xl px-4 lg:px-8">
        <h2 className="text-balance text-center text-3xl font-bold lg:text-4xl">
          Connect. Discover. Make a Difference.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-blue-100">
          Bringing together the causes that matter most — in one simple,
          beautiful place.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-6 rounded-[45px] bg-white p-8 text-gray-900 shadow-2xl md:grid-cols-3 lg:p-10">
          {INFO_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`p-4 ${
                  i !== INFO_CARDS.length - 1
                    ? "border-b border-gray-200 md:border-b-0 md:border-r"
                    : ""
                }`}
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-primary">
                  <Icon size={22} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
