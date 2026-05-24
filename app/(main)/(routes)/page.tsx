import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const state = true;

export default function Home() {
  return (
    <div className="">
      <p className="text-3xl font-bold text-indigo-500">Console.Dev main page</p>
      <p>This must be a protected route.</p>
      <Button className="cursor-pointer">Click me</Button>
    </div>
  );
}
