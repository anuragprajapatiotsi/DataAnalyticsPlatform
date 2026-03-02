export default function TeamsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <div className="flex-1">{children}</div>
    </div>
  );
}
