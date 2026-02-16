export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const petals = Array.from({ length: 22 }, (_, index) => {
    const size = 10 + (index % 5) * 3;
    const left = (index * 7.3) % 100;
    const duration = 10 + (index % 6) * 1.35;
    const delay = (index % 7) * -1.2;
    const driftStart = -20 + (index % 5) * 8;
    const driftEnd = 20 - (index % 4) * 7;
    const rotate = (index % 2 === 0 ? 1 : -1) * (8 + (index % 4) * 4);

    return {
      key: `petal-${index}`,
      style: {
        "--admin-petal-size": `${size}px`,
        "--admin-petal-left": `${left}%`,
        "--admin-petal-duration": `${duration}s`,
        "--admin-petal-delay": `${delay}s`,
        "--admin-petal-drift-start": `${driftStart}px`,
        "--admin-petal-drift-end": `${driftEnd}px`,
        "--admin-petal-rotate": `${rotate}deg`,
      } as React.CSSProperties,
    };
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f2ef]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-16 h-72 w-72 rounded-full bg-[#fff7ea]/80 blur-3xl" />
        <div className="absolute right-[-90px] top-[12%] h-80 w-80 rounded-full bg-[#f8eddc]/75 blur-3xl" />
        <div className="absolute bottom-[-140px] left-1/2 h-96 w-[520px] -translate-x-1/2 rounded-full bg-[#efe4d0]/70 blur-3xl" />
      </div>

      <div className="admin-petal-layer pointer-events-none absolute inset-0">
        {petals.map((petal) => (
          <span key={petal.key} className="admin-petal" style={petal.style} />
        ))}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}

