import { CheckboxList } from "@/components/CheckboxList";


export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
     <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Day Organizer</h1>
      <p className="text-lg">Organize your day with ease</p>
      <CheckboxList />
     </div>
    </div>
  );
}
