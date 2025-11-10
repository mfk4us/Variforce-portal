// Minimal layout for dialog iframes — no admin chrome
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
}