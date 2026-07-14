export default function Section({ children, className = '', id = '' }) {
  return (
    <section id={id} className={`py-8 md:py-12 ${className}`}>
      {children}
    </section>
  );
}