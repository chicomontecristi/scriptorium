// ─── CHAPTER CONTENT ────────────────────────────────────────────────────────
// THE HUNT — A Novella by Chico Montecristi (José Chavez)
//
// Chapter One is fully readable. Chapters Two through Seven are locked.
// To unlock a chapter: set isLocked: false
// Phase 2: This will feed from Supabase CMS.

import type { Chapter } from "@/lib/types";

export const CHAPTERS: Record<string, Chapter> = {
  one: {
    slug: "one",
    number: 1,
    romanNumeral: "ONE",
    title: "What Robbin Told Alma",
    subtitle: "The Diner at the Edge of Little Pines",
    epigraph: {
      text: "You can't really trust the voices you hear.",
      attribution: "The Hunt",
    },
    isLocked: false,
    wordCount: 3378,
    paragraphs: [
      { index: 0, text: `Robbin sat with the new nurse, Alma Mae, discussing the events of Gertrude's death.`},
      { index: 1, text: `Alma didn't know what she was in for. That within forty-five minutes the story of a teacher's suicide would be mustered over lunch like fries. Some of Robbin's information isn't reliable, for she wasn't there, but she's as close to the truth as anyone else.`},
      { index: 2, text: `"So, where should I begin?" Robbin said. "Mrs.\u00a0Gertrude Barrow was a teacher at the Little Pines School. Loved and respected by everyone; she lit up the room with her Colgate smile! Robbin was a fat slob, a careless waste. Her jealousy oozed through her pores and pig-haired skin like the ketchup from its glass bottle. She continued her explanations in an envious tone to Alma."Growing up, her dedication to schooling, her authority and leadership among us left many in awe. Her parents, the Sanders, die-hard community members! Always at Sunday mass, members of the school board... to add, college funds in place; declaring them THE best parents you can imagine. No wonder she turned out so perfect..." she paused and smirked.`},
      { index: 3, text: `"Gertrude was so popular we created a darn chart so everyone knew when she was available! Can you believe that?! Sunday dinner, birthday parties and baptisms were booked months in advance," she laughed throwing her head back. "You can imagine how the town felt when we heard the news of her death... I was one of the first to hear, I'll have you know... My friend in the department called me late that very afternoon. I cried the second he hung up the phone. Couldn't believe she was dead... I thought it was a joke!"`},
      { index: 4, text: `"It was the talk of town; people drew their own conclusions, and,"Honey", suicide was not one of them," she said, touching Alma's arm. As she reached over for her coffee some had spilled in the process.`},
      { index: 5, text: `"How's that coffee, Alma?"`},
      { index: 6, text: `"It'll do!"`},
      { index: 7, text: `"You sure don't drink coffee for a nurse. Well, where was I?"`},
      { index: 8, text: `"People and something about conclusions...?" Alma replied.`},
      { index: 9, text: `"That's right! Well, school remained closed until mid-September, the principal thought it was the best thing to do, under the circumstances."Mrs.\u00a0B died?!", the children used to ask in disbelief. It was terrible! Seeing their tears, hearing their cries, day in day out. She was like a mother to these kids. Shoot, my own children loved her more than me! Those little bastards!"`},
      { index: 10, text: `She reached into her purse and showed Alma a picture she kept.`},
      { index: 11, text: `"Is this Gertrude?"`},
      { index: 12, text: `"Yes, ma'am! That's us in our cheer leading days."`},
      { index: 13, text: `"She was quite the package, huh..." Alma was impressed staring at their uniforms.`},
      { index: 14, text: `"Honey, you don't know the half of it."`},
      { index: 15, text: `"Did she have kids?"`},
      { index: 16, text: `"She sure did! She left behind a pretty young thing named Michelle... I'll tell you more about her in bit, just let me stay on track..."`},
      { index: 17, text: `"Go on," Alma replied smiling. Lunch time was slowly winding down, but the story made the watch on her left wrist disappear.`},
      { index: 18, text: `"The Sanders thought there was foul play and they demanded the sheriff, hell, the State of Colorado, do something about it. Seeing days go by and nobody arrested, they went straight to the news station in Denver to tell"em all about it. Became national news overnight, don't know how you didn't hear."`},
      { index: 19, text: `Robbin paused, looking around the diner, she got up and sat right next to Alma Mae's side of the booth and began to whisper.`},
      { index: 20, text: `"Next thing you know, we had a Gerald D. Flint coming from New York, ready to defend John's rights..."`},
      { index: 21, text: `"Wait, who's John?"`},
      { index: 22, text: `"Her husband, keep up!" Robbin continued to whisper. "Flint came down here to defend Gertrude's husband, something to do with"innocent until proven guilty." Around here though, for John, is more like "guilty until proven innocent." I never liked him after he came back from the war, he had changed. Not the John I knew from High School. I'm sure he did it! He seemed depressed. We had a lot of those guys come by the clinic, like... uh... whatchamacallit... What's that crazy ladies name? The chatty one...`},
      { index: 23, text: `"Misses Dwight?"`},
      { index: 24, text: `"Bingo! Her ex-husband used to beat her, on the daily. Well, he did that before the war too. It was obvious.`},
      { index: 25, text: `"Poor thing!" Alma responded placing her hand over her lips in astonishment. "There seems to be plenty sides to this story, you think we'll have time to get to the end of it before lunchtime is over?"`},
      { index: 26, text: `"Yeah, yeah... Don't worry. Time nor who gets beat are my concern. You know, I won't get to finish if you keep interrupting me,"Sweetheart". By the time the newspapers published the news and that Flint guy came around things didn't make sense. With the crime scene, that is... Bryant had rushed back into town when he got the call. The streets were lit by cop cars, yellow tape everywhere. Like a Clint Eastwood movie! He didn't know what to expect, until he walked in..."`},
      { index: 27, text: `The house was intact, no sign of struggle. The sunlight pierced through the windows; you could count each particle of dust as though time had slowed down. As he entered, deputies gave Bryant a run-down, but he couldn't hear a thing.`},
      { index: 28, text: `"Making his way to the living room, Bryant saw John holding Michelle tightly, rocking back and forth on the couch. He kept crying and holding her head, patting her hair and shoulder. And, just like me, the sheriff was shocked to see how strong Gertrude's daughter was even though her hands, face and dress were stained with blood. I know I wasn't there, but had I witnessed this myself I wouldn't know what to think."`},
      { index: 29, text: `"Wait, your friend on the phone, Bryant, is the Sheriff?!"`},
      { index: 30, text: `"No shit, Sherlock!"`},
      { index: 31, text: `Almost spilling her coffee, "So, then what?" Alma asked.`},
      { index: 32, text: `"I was trying to get to that..." Robbin rolled her eyes. "So, Michelle just stared back, letting her father cry against her dress. The sheriff didn't know what to do or say, so the deputies pointed to the master bedroom..."`},
      { index: 33, text: `After taking a short sip of her now lukewarm coffee, Robbin whispered. "The body!"`},
      { index: 34, text: `Gertrude was laying on the bed, under the covers, with a book by her side. Her blood had dripped for hours by the time Bryant made it to the room, tiptoeing, still wearing golf shoes... There was a gun by the bed and Gertrude's hand hung above it. Bryant tried looking away, away from the gun and the puddle of blood, away from her brains scattered across the bed and the eggshell walls. Part of the wound was covered with soft, strawberry blond hair, caving into her skull.`},
      { index: 35, text: `"I know you're eating, Honey, but I want to get to the good part..."`},
      { index: 36, text: `Alma swallowed and chewed soggy fries, barely touching her ketchup. "Bryant says he almost barfed when he saw her mouth and eyes open, full of flies. It was a hot summer day; imagine the smell!"`},
      { index: 37, text: `Bryant headed towards John to ask him some questions, but John would only rock back and forth, crying.`},
      { index: 38, text: `"John, we'll need you to give us a statement," but seeing how shell-shocked he was, how the blood in his hands got stuck to Michelle's hair, he knew John couldn't do it right, then and there. Sheriff Bryant decided to have him over later that night, to describe what happened. And he did. By then reporters were buzzing and stayed for weeks. A pest! When it was time to head to the Sheriff's Department, they flew towards John with their camcorders at arm's length.`},
      { index: 39, text: `"Hey, Alma, you see that gentleman sitting at the end of the grill...?" Robbin pointed.`},
      { index: 40, text: `"Yes," she whispered, her head pointing down.`},
      { index: 41, text: `"Well, don't look at him! That's Tom, their neighbor. He had to put up with it as well. He also testified. And it turns out, he was John's alibi!"`},
      { index: 42, text: `"Wait, wait... their neighbor what?"`},
      { index: 43, text: `"Exactly! Apparently, Tom gave the same testimony multiple times..."`},
      { index: 44, text: `Early morning John had been working on the front yard. Raking leaves, mowing the lawn, watering plants and filling up his bird seeders; his normal routine, if you ask me... For the fifteen years John lived next door he worked on his yard while I read my Sunday paper. Nothing seemed out of place. If anything, I expected to see little Michelle running "round the yard helping or playing with the birds... But I don't recall seeing her this Sunday. I didn't think anything of it. After all, she's only a child. Soon I heard a shot, went to the window and there was John, running towards the house."`},
      { index: 45, text: `"No matter how many times Sheriff Bryant asked Tom to go over the story, nothing changed. John appeared to have nothing to do with his wife's death and the alibi checked out." Pointing to an older gentleman wearing a gray, wool coat. "Look at Tom right now, reading his paper, like nothing ever happened."`},
      { index: 46, isSectionBreak: true, text: ``},
      { index: 47, text: `"Poor Tom, those reporters tried ripping his heart out: Why are you protecting a murderer? Are you in on the murder too? No wonder he doesn't like talking much anymore..."`},
      { index: 48, text: `They wanted a story, no matter whose dignity was on the line; murder sells, suicide doesn't.`},
      { index: 49, text: `"What a shame. Tom has been nothing but a saint, a good man, one of the few left in this small town. Reads his paper, goes back home, gets another paper, comes back... Every day, and he don't bother nobody, I tell you. He got nothing to do with it. It's John that I question. Gertrude... Kill herself... No way!"`},
      { index: 50, text: `"Seems like a harmless old man to me," Alma chimed in.`},
      { index: 51, text: `"And listen to this! After he testified, that Flint, lawyer-man busted in the department and stopped the interrogation. Said his client didn't need to answer questions without legal representation. John didn't even know who he was..."`},
      { index: 52, text: `Alma stared at the clock above the window, listening to its ticks.`},
      { index: 53, text: `"I worked my way into the department, with a little help from Bryant," she glowed, winking. "I was able to hear a thing or two as this mess unfolded. The interrogation room alone couldn't fit another deputy. Mr. Flint had a whole team of lawyers behind him taking notes and providing him with documents at the snap of a finger. It was clip this and get that! They were preparing for the worst."`},
      { index: 54, text: `The People of Colorado v. John Barrow.`},
      { index: 55, text: `When the time came for John to give his statement, everyone in the department froze; desperate to look into the mind of a killer, into the mind of a man they thought could kill his loving wife and bathe his daughter in her blood, without remorse.`},
      { index: 56, text: `"It was heartfelt. I could hear him sobbing and screaming the entire time from all the way out in the waiting room."`},
      { index: 57, text: `John could barely make a word without choking up.`},
      { index: 58, text: `"Of course I got a word or two out of Bryant afterwards... this was something I just couldn't go to sleep without knowing, girl. Apparently, he asked John to describe the events that took place that Sunday morning, prior to and after her presumed suicide. I can imagine the deputies eager to hear John confess."`},
      { index: 59, text: `Hearing the commotion, Bryant stepped aside.`},
      { index: 60, text: `"Give me a second John, I'll be right back!" Sheriff Bryant said while stepping outside the interrogation room. "Can you maggots keep it down a bit?! I can hear all of you tapping on the glass! Deputy Stanley, next person to even hint at a word, have"em removed!"`},
      { index: 61, text: `The room went silent.`},
      { index: 62, text: `"Sorry about that John, ready to begin?"`},
      { index: 63, text: `John responded, "As unfortunate as this may be... Yes, I am ready."`},
      { index: 64, text: `"Alright, the floor is yours, John. Walk me through this," John stared closely at the dark tinted glass, searching for faces.`},
      { index: 65, text: `"I'll remember this day for the rest of my life, for the wrong reasons. Sundays were always my favorite days. I'd plan all my yard work, gather my tools and materials the night before. By early morning, I had it all done. Then Trudy would come out with water, sometimes lemonade, she was so sweet," he paused. "Loved seeing her glancing at the rose bushes, the buttercups, the sunflowers, her..." he choked, "...her favorites. She never stayed out for too long, but, for that moment, I felt like the luckiest man on earth cos I had the kindest woman on earth. I know she was very absent after her brother Michael passed, but even then, she found ways to make me feel that I was important to her, that Michelle and I were important to her. I can almost picture her right now wearing her sundress, barefooted, with her blond hair down."`},
      { index: 66, text: `Feeling John's emotional state, Bryant interrupted. "I know it's hard for you, John, but could you try to stay within the subject?" Sheriff Bryant asked.`},
      { index: 67, text: `"He murdered that woman!" a deputy interjected behind the glass.`},
      { index: 68, text: `"Please have him removed!" Deputy Stanley requested calmly. John couldn't speak. He almost went mute. His thoughts were eating at him.`},
      { index: 69, text: `"John..." Sheriff Bryant insisted.`},
      { index: 70, text: `"Yes?" John looked up as he sat on his wooden chair, sobbing in disbelief.`},
      { index: 71, text: `"Please, continue."`},
      { index: 72, text: `John was under a lot of stress. Hands shaking, sweat rolling down his ear. He continued, "I want everyone to know what I saw when I saw her. That every time she was near me my throat would close, that when she looked my way I smiled, that there was never one day I wasn't in love with her, that she's all I ever wanted!" He stopped to look straight into the glass.`},
      { index: 73, text: `"I. DID. NOT. KILL. TRUDY. She was my everything, my one and only. I would give my life right now if it meant I would see her again. If it meant she would live, and I died. I would put a bullet through my head this second if it would show you the truth; if it would turn back time and bring her back. Brought back Michelle's mother, my Trudy."`},
      { index: 74, text: `"Trudy! Trudy! Why did you leave us, why did you leave me?" he yelled with tears in his red eyes.`},
      { index: 75, text: `The sheriff wasn't moved. It has been known that most homicides are committed by the hands of those closest to the victim, and when things settled down, he continued the interrogation. "Mr.\u00a0Barrow, who's gun was found next to Gertrude?"`},
      { index: 76, text: `"It was my gun," John responded plainly.`},
      { index: 77, text: `"Where was the gun before the incident took place?"`},
      { index: 78, text: `"I kept all my guns in the same case, by the living room."`},
      { index: 79, text: `"And did this"case" of yours have a key, some sort of security. Say, a lock so that a child the age of Michelle wouldn't have access to?"`},
      { index: 80, text: `"Of course! It was locked!" he said confidently. "But my keys were in the same spot I had always placed them. Right by the door. Trudy always knew where they were. It wasn't a secret. I did it mostly cos of Michelle... didn't want her opening the case."`},
      { index: 81, text: `"And why, Mr.\u00a0Barrow, if I may ask, why would your eight-year-old daughter want to open a gun case?"`},
      { index: 82, text: `"I'm not sure, I didn't say she did. I said I didn't want her having access, that's all."`},
      { index: 83, text: `"So, you mean to say that somehow, early in the morning, your wife decided to pull Of Mice and Men from her library, grab a handgun, go back to her bed, read a couple of pages, and then blow her brains out?" Sheriff Bryant's tone switched from good cop to bad cop at the blink of an eye, but even he knew sensitivity was of the essence. "L...Let me rephrase my question, Mr.\u00a0Barrow", Bryant stuttered. "Does it make sense for all these events to take place before your wife"supposedly" committed suicide?"`},
      { index: 84, text: `"No, it doesn't make sense."`},
      { index: 85, text: `Another deputy spoke, "I knew it!" Another deputy gone.`},
      { index: 86, text: `"So, you do agree that things don't add up, right, Mr.\u00a0Barrow?"`},
      { index: 87, text: `A sharply dressed man busted through the door. "I'm Gerald D. Flint!" he said, "From now on, I'll be your attorney, Mr.\u00a0Barrow. You don't have to say a single word or answer any more questions. The way I see it, for all we know, you are innocent. You've done nothing wrong and if there is no evidence to demonstrate otherwise, you are a free man," was all he said.`},
      { index: 88, text: `Mr.\u00a0Tom's alibi placed John outside at the time of the shot. Leaving only two people inside the house: Gertrude and her daughter Michelle. The sheriff couldn't pin any evidence to suggest that John was the one who pulled the trigger, but he wasn't going to entertain any other ideas. Since she was waiting outside, Sheriff Bryant decided to call the only other person that was inside the house when everything took place.`},
      { index: 89, text: `This caught everyone by surprise. The deputies rushed behind him. "It's alright, boys. John..."`},
      { index: 90, text: `John with a shocked face looked up. "Do you mind if I have a word with Michelle?"`},
      { index: 91, text: `Mr.\u00a0Flint advised him not to. "Absolutely not, Mr.\u00a0Barrow! You are innocent and they have no evidence." But John obliged.`},
      { index: 92, text: `For the deputies, seeing Michelle walk into the interrogation room was unsettling.`},
      { index: 93, text: `"From the other end of the station, I could see Bryant scratching his chin while standing by the door, he probably didn't know where to start," Robbin added to her fragmented pieces of the story.`},
      { index: 94, text: `Alma nodded and looked around the diner, imagining this macabre day.`},
      { index: 95, text: `Bryant wanted to go about it with as much sweetness as he possibly could, but his true intention was nothing but sour.`},
      { index: 96, text: `He began with something simple: "How are you, Michelle?"`},
      { index: 97, text: `"Good," she responded holding her hands together.`},
      { index: 98, text: `"Excited for the school year?"`},
      { index: 99, text: `"Yes. This year I'm in fifth grade, I got to skip!"`},
      { index: 100, text: `"Wonderful! Just wonderful. Did you get your summer reading done?"`},
      { index: 101, text: `"Yes, I did! Read my final page this morning."`},
      { index: 102, text: `"Did you like the book?"`},
      { index: 103, text: `"I liked it very much so."`},
      { index: 104, text: `John sat by the door, next to Flint.`},
      { index: 105, text: `"And why is that, Michelle?"`},
      { index: 106, text: `"Because it reminded me of the things my father has taught me..." Sheriff Bryant moved towards the edge of his seat and made sure the recorder was on. The light was red and the magnetic tape was surely spinning, creating sounds reminiscent of wind scratching tin rooftops.`},
      { index: 107, text: `"Oh, he has taught you things, you say. What kind of things, Michelle?" The deputies thought Bryant found his opportunity, but Michelle disappointed.`},
      { index: 108, text: `"Papa has taught me that when things are hurt, we must help them get better," Michelle responded looking directly into Bryant's eyes.`},
      { index: 109, text: `Bryant almost began to cry, for even now she showed so much devotion to her father. Even now, wearing a blood stained dress at the sight of John being questioned about murdering her mother. Finding no way of pinning evidence to John, he stood up and showed Michelle the way out the door.`},
      { index: 110, text: `"She was out almost immediately," Robbin said wiping crumbs off the table. "That's as far as I go, unfortunately. For I'm only going off the things I've heard. Last thing, nurse Alma... Make sure to never repeat anything I've said. Ever!"`},
      { index: 111, text: `"Of course not!" Alma responded.`},
      { index: 112, text: `Time passed by faster than planned. "You sure eat fast nurse Alma. Not even the napkins survived."`},
      { index: 113, text: `Alma replied shyly, "I try to stick to my diet, but I just can't help it sometimes."`},
      { index: 114, text: `"Look at me, barely finished my soup," holding her bowl by the sides Robbin showed Alma. Alma blushed with embarrassment swiping at the edges of her white skirt. "Sorry, I didn't mean it like that."`},
      { index: 115, text: `"No harm done nurse Robbin. Mother Berta reminds me every day."`},
      { index: 116, text: `"We better get back now. I wonder how things are going at the corridors. I figure one of us should get back to our patients."`},
      { index: 117, text: `Alma wiped her mouth.`},
      { index: 118, text: `"All we can do is keep quiet and let the others battle it out."`},
      { index: 119, text: `"Alright!" Alma said licking the grease off her fingers.`},
      { index: 120, text: `"Keep your mouth shut! Most likely Stubby Linda will discipline us by having us reorganize and look over patient charts."`},
      { index: 121, text: `"I don't mind..." Alma responded, still savoring her food.`},
      { index: 122, text: `"You say that now, but everyone agrees she's quite the cunt."`},
      { index: 123, text: `"You can't really trust the voices you hear," Alma said slyly, walking out the diner.`},
    ],
  },

  two: {
    slug: "two",
    number: 2,
    romanNumeral: "TWO",
    title: "Corridor B",
    subtitle: "The Clinic, Earlier That Morning",
    epigraph: {
      text: "Every door in that building opened onto something nobody was ready for.",
      attribution: "The Hunt",
    },
    isLocked: true,
    wordCount: 3171,
    paragraphs: [
      // SEALED — unlocks when you publish
    ],
  },

  three: {
    slug: "three",
    number: 3,
    romanNumeral: "THREE",
    title: "Regular Hours",
    subtitle: "Alma Mae, at Her Desk",
    epigraph: {
      text: "Business as usual is the cruelest of lies.",
      attribution: "The Hunt",
    },
    isLocked: true,
    wordCount: 1483,
    paragraphs: [
      // SEALED — unlocks when you publish
    ],
  },

  four: {
    slug: "four",
    number: 4,
    romanNumeral: "FOUR",
    title: "The Smell of Coffee and Syrup",
    subtitle: "The Family Cabin, the Barrow History",
    epigraph: {
      text: "Some houses remember everything. Some families forget on purpose.",
      attribution: "The Hunt",
    },
    isLocked: true,
    wordCount: 4378,
    paragraphs: [
      // SEALED — unlocks when you publish
    ],
  },

  five: {
    slug: "five",
    number: 5,
    romanNumeral: "FIVE",
    title: "What Blood Requires",
    subtitle: "Michelle, Grown",
    epigraph: {
      text: "She was not the kind of person you could protect someone from.",
      attribution: "The Hunt",
    },
    isLocked: true,
    wordCount: 6890,
    paragraphs: [
      // SEALED — unlocks when you publish
    ],
  },

  six: {
    slug: "six",
    number: 6,
    romanNumeral: "SIX",
    title: "The Stories People Tell",
    subtitle: "The Pines, the Town, the Years",
    epigraph: {
      text: "In a small town, the truth arrives last and is the least believed.",
      attribution: "The Hunt",
    },
    isLocked: true,
    wordCount: 5796,
    paragraphs: [
      // SEALED — unlocks when you publish
    ],
  },

  seven: {
    slug: "seven",
    number: 7,
    romanNumeral: "SEVEN",
    title: "Once Again",
    subtitle: "The Cabin. The Lake. The End.",
    epigraph: {
      text: "Once again, Michelle pulled the trigger.",
      attribution: "The Hunt",
    },
    isLocked: true,
    wordCount: 1361,
    paragraphs: [
      // SEALED — unlocks when you publish
    ],
  },

};

export function getChapter(slug: string): Chapter | null {
  return CHAPTERS[slug] ?? null;
}

export function getAllChapterSlugs(): string[] {
  return Object.keys(CHAPTERS);
}