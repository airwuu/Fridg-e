import Image from "next/image";
import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"


export default function Home() {
  return (
    <>
     <div className="flex flex-row-reverse mr-5 pt-2 ">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem className=" px-1"> 
            {<Link href="/login" legacyBehavior passHref >
              <NavigationMenuLink className="text-xl">
                Login
              </NavigationMenuLink>
            </Link>}
          </NavigationMenuItem>
          </NavigationMenuList>
      </NavigationMenu>
    </div>
    <div>
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* put stuff here max */}
      <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start border-8 border-amber-300 w-full h-full">
        crazy stuff
        
      </div>


      <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            uwu fridge stuff
          </li>
          <li className="tracking-[-.01em]">
            wow save bunch of food by actually eating
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Sign Up
          </a>

        </div>
      </div>
    
    </div>
    
    </div>
    </>
  );
}
