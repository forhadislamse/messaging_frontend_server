"use client";
import pageNotFound from "@/assets/lottieFiles/pageNotFound.json";
import NextButton from "@/components/ui/buttons/NextButton/NextButton";
import Lottie from "lottie-react";
import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="h-screen">
      <Lottie className="h-[calc(100vh-300px)] py-5" animationData={pageNotFound} loop={true} />
      <h3 className="text-center text-8xl font-semibold">Page Not Found</h3>
      <Link href="/" className="">
        <NextButton className="mt-10">
          <span className="text-2xl">Go to Home</span>
        </NextButton>
      </Link>
    </div>
  );
};

export default NotFoundPage;
