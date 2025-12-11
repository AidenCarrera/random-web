"use client";

export default function NeoBrutalism() {
  return (
    <div className="min-h-screen bg-[#ffff00] p-8 font-sans flex items-center justify-center">
      <div className="max-w-xl w-full bg-[#bd93f9] border-8 border-black shadow-[20px_20px_0px_0px_#000000] p-12 relative">
        <div className="absolute -top-6 -right-6 bg-[#ff79c6] border-4 border-black px-4 py-2 font-black text-xl rotate-12 shadow-[5px_5px_0px_0px_#000000]">
          USELESS FORM
        </div>

        <h1 className="text-6xl font-black mb-12 uppercase leading-none drop-shadow-[5px_5px_0px_#fff]">
          Submit to Nothing
        </h1>

        <div className="space-y-8">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-xl uppercase bg-black text-white inline-block w-fit px-2">
              Your Name
            </label>
            <input
              type="text"
              className="w-full bg-white border-4 border-black p-4 text-2xl font-bold focus:shadow-[10px_10px_0px_0px_#000000] focus:translate-x-[-5px] focus:translate-y-[-5px] transition-all outline-none placeholder:text-gray-400 uppercase"
              placeholder="JOHN DOE"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-xl uppercase bg-black text-white inline-block w-fit px-2">
              Your Complaint
            </label>
            <select className="w-full bg-white border-4 border-black p-4 text-2xl font-bold focus:shadow-[10px_10px_0px_0px_#000000] transition-all outline-none appearance-none cursor-pointer">
              <option>TOO LOUD</option>
              <option>TOO BRIGHT</option>
              <option>TOO YELLOW</option>
              <option>I HATE FORMS</option>
            </select>
          </div>

          <div className="flex gap-4 items-center">
            <input
              type="checkbox"
              className="w-12 h-12 border-4 border-black appearance-none checked:bg-black checked:after:content-['✓'] checked:after:text-white checked:after:flex checked:after:justify-center checked:after:items-center checked:after:text-4xl checked:after:font-bold cursor-pointer bg-white"
            />
            <span className="font-bold text-xl uppercase">
              I agree to lose my data
            </span>
          </div>
        </div>

        <button className="w-full mt-12 bg-[#ff5555] border-4 border-black p-6 text-4xl font-black uppercase hover:bg-white hover:shadow-[10px_10px_0px_0px_#000000] active:translate-y-[5px] active:translate-x-[5px] active:shadow-none transition-all">
          SCREAM INTO VOID
        </button>
      </div>
    </div>
  );
}
