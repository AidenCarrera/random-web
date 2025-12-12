"use client";

import { useState } from "react";
import { Quote } from "lucide-react";

const QUOTES = [
  "The only true wisdom is in knowing you know nothing.",
  "What you seek is seeking you.",
  "Be the change that you wish to see in the world.",
  "In the middle of difficulty lies opportunity.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Everything you can imagine is real.",
  "Simplicity is the ultimate sophistication.",
  "The journey of a thousand miles begins with one step.",
  "What we think, we become.",
  "The unexamined life is not worth living.",
  "Happiness depends upon ourselves.",
  "To love is to recognize yourself in another.",
  "He who has a why to live can bear almost any how.",
  "Life must be understood backward. But it must be lived forward.",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
  "Believe you can and you're halfway there.",
  "Change your thoughts and you change your world.",
  "Wherever you go, go with all your heart.",
  "If you tell the truth, you don't have to remember anything.",
  "A friend is someone who knows all about you and still loves you.",
  "Live as if you were to die tomorrow. Learn as if you were to live forever.",
  "No one can make you feel inferior without your consent.",
  "It is never too late to be what you might have been.",
  "Do one thing every day that scares you.",
  "We must accept finite disappointment, but never lose infinite hope.",
  "The best way to predict the future is to create it.",
  "You miss 100% of the shots you don't take.",
  "Whatever you are, be a good one.",
  "I have not failed. I've just found 10,000 ways that won't work.",
  "A journey of a thousand leagues begins beneath one's feet.",
  "Quiet people have the loudest minds.",
  "Those who dare to fail miserably can achieve greatly.",
  "Get busy living or get busy dying.",
  "The only limit to our realization of tomorrow will be our doubts of today.",
  "It is always darkest before the dawn.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The mind is everything. What you think you become.",
  "Your time is limited, so don't waste it living someone else's life.",
  "Winning isn't everything, but wanting to win is.",
  "I am not a product of my circumstances. I am a product of my decisions.",
  "Every child is an artist. The problem is how to remain an artist once he grows up.",
  "You can never cross the ocean until you have the courage to lose sight of the shore.",
  "Either you run the day, or the day runs you.",
  "Life is 10% what happens to me and 90% of how I react to it.",
  "There is no substitute for hard work.",
  "The only way to do great work is to love what you do.",
  "The best revenge is massive success.",
  "Life is what happens when you're busy making other plans.",
  "Strive not to be a success, but rather to be of value.",
  "Two roads diverged in a wood, and I—I took the one less traveled by, And that has made all the difference.",
  "I attribute my success to this: I never gave or took any excuse.",
  "You become what you believe.",
  "The most difficult thing is the decision to act, the rest is merely tenacity.",
  "Definiteness of purpose is the starting point of all achievement.",
  "We become what we think about.",
  "Life shrinks or expands in proportion to one's courage.",
  "If you hear a voice within you say 'you cannot paint,' then by all means paint and that voice will be silenced.",
  "Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.",
  "Few things can help an individual more than to place responsibility on him, and to let him know that you trust him.",
  "Certain things catch your eye, but pursue only those that capture the heart.",
  "Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.",
  "Don't watch the clock; do what it does. Keep going.",
  "Keep your face always toward the sunshine—and shadows will fall behind you.",
  "You make a life out of what you have, not what you're missing.",
  "Limit your 'always' and your 'nevers'.",
  "Nothing is impossible. The word itself says 'I'm possible'!",
  "You are enough just as you are.",
  "Act as if what you do makes a difference. It does.",
  "Success usually comes to those who are too busy to be looking for it.",
  "Don't wait. The time will never be just right.",
  "Everything you've ever wanted is on the other side of fear.",
  "Success represents the 1% of your work which results from the 99% that is called failure.",
  "I would rather die of passion than of boredom.",
  "Build your own dreams, or someone else will hire you to build theirs.",
  "I have learned over the years that when one's mind is made up, this diminishes fear.",
  "Does thou love life? Then do not squander time, for that is the stuff life is made of.",
  "Go confidently in the direction of your dreams. Live the life you have imagined.",
  "When I let go of what I am, I become what I might be.",
  "The question isn't who is going to let me; it's who is going to stop me.",
  "It is not the years in your life that count. It is the life in your years.",
  "There is only one way to avoid criticism: do nothing, say nothing, and be nothing.",
  "You can't use up creativity. The more you use, the more you have.",
  "Fall seven times and stand up eight.",
  "When everything seems to be going against you, remember that the airplane takes off against the wind, not with it.",
  "Challenges are what make life interesting and overcoming them is what makes life meaningful.",
  "If you want to lift yourself up, lift up someone else.",
  "Limitations live only in our minds. But if we use our imaginations, our possibilities become limitless.",
  "Too many of us are not living our dreams because we are living our fears.",
  "The person who says it cannot be done should not interrupt the person who is doing it.",
  "The day is what you make it! So why not make it a great one?",
  "Write it on your heart that every day is the best day in the year.",
  "It is never too late to be what you might have been.",
  "Your big opportunity may be right where you are now.",
  "A person who never made a mistake never tried anything new.",
  "It is better to fail in originality than to succeed in imitation.",
  "The real opportunity for success lies within the person and not in the job.",
  "Little minds are tamed and subdued by misfortune; but great minds rise above it.",
  "Failure is the condiment that gives success its flavor.",
  "Don't let yesterday take up too much of today.",
  "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
  "Experience is a hard teacher because she gives the test first, the lesson afterwards.",
  "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
  "Setting goals is the first step in turning the invisible into the visible.",
  "He that can have patience can have what he will.",
];

export default function PaperEditorial() {
  const [fortune, setFortune] = useState<string | null>(null);

  const revealFortune = () => {
    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setFortune(random);
  };

  return (
    <div
      className="min-h-screen bg-[#f4f1ea] text-[#2c2925] p-8 md:p-16 flex flex-col items-center pt-24"
      style={{
        backgroundImage:
          'url("https://www.transparenttextures.com/patterns/cardboard-flat.png")',
      }}
    >
      <div className="max-w-2xl w-full bg-[#fdfbf7] p-12 shadow-[rgba(0,0,0,0.1)_10px_10px_20px] border border-[#e3dacd] relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#2c2925]" />

        <header className="border-b-2 border-[#2c2925] pb-6 mb-8 text-center">
          <h1 className="font-serif text-5xl italic font-bold">
            The Daily Oracle
          </h1>
          <p className="mt-2 text-sm uppercase tracking-widest font-sans text-gray-500">
            Vol. CCLXXIV — {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="flex justify-center mb-10">
          <button
            onClick={revealFortune}
            className="group relative px-8 py-4 font-serif text-xl border border-[#2c2925] hover:bg-[#2c2925] hover:text-[#f4f1ea] transition-all duration-300 active:translate-y-1"
          >
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#2c2925] group-hover:bg-[#f4f1ea]" />
            <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#2c2925] group-hover:bg-[#f4f1ea]" />
            Consult the Oracle
          </button>
        </div>

        {fortune && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-center min-h-[120px]">
            <Quote className="w-8 h-8 text-[#2c2925] mx-auto mb-4 opacity-50 rotate-180" />
            <p className="font-serif text-3xl leading-relaxed font-medium">
              &quot;{fortune}&quot;
            </p>
            <Quote className="w-8 h-8 text-[#2c2925] mx-auto mt-4 opacity-50" />
          </div>
        )}

        <div className="mt-16 pt-4 border-t border-[#e3dacd] flex justify-between text-xs font-sans text-gray-400 uppercase tracking-wider">
          <span>Pg. 7</span>
          <span>Est. 1924</span>
        </div>
      </div>
    </div>
  );
}
