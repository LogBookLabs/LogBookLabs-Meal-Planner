import './globals.css';

export const metadata = {
  title: 'Meal Planner Pro',
  description: 'Your personal meal planning assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
