
def get_movies():
    content: list[str] = [
    "Miss Americana (1 hr 25 min): Explore the personal and artistic journey of singer-songwriter Taylor Swift in this revealing documentary.",
    "The Devil All the Time (2 hr 18 min): In a postwar backwoods town, sinister characters converge around a disturbed young man devoted to protecting those he loves.",
    "Enola Holmes (2 hr 3 min): Sherlock Holmes' brilliant younger sister sets off on her own detective adventure to find her missing mother.",
    "The Trial of the Chicago 7 (2 hr 9 min): Based on true events, activists face federal charges and a notorious trial following protests at the 1968 Democratic National Convention.",
    "Hubie Halloween (1 hr 43 min): A quirky volunteer sets out to keep his town safe on Halloween, but gets tangled in real danger and chaos.",
    "The Social Dilemma (1 hr 34 min): Ex-tech insiders reveal how social media manipulates users and shapes society in this eye-opening documentary.",
    "Athlete A (1 hr 44 min): Follow investigations into the crimes of USA Gymnastics doctor Larry Nassar and the survivors seeking justice.",
    "Crip Camp: A Disability Revolution (1 hr 48 min): A groundbreaking summer camp inspires a group of teens with disabilities to launch a movement for accessibility.",
    "The Mitchells vs. The Machines (1 hr 54 min): An ordinary family becomes humanity’s last hope during a tech apocalypse in this animated adventure.",
    "Love and Monsters (1 hr 49 min): Seven years after a monster apocalypse, a lovelorn survivor embarks on a daring journey to reunite with his girlfriend.",
    "The Woman in the Window (1 hr 41 min): An agoraphobic psychologist’s world unravels when she witnesses something disturbing from her window.",
    "Army of the Dead (2 hr 28 min): Mercenaries venture into a zombie-infested Las Vegas for a risky heist, facing dangers both living and undead.",
    "He's All That (1 hr 31 min): A social media influencer vows to transform a shy classmate into prom king for an online challenge.",
    "Afterlife of the Party (1 hr 49 min): A social butterfly dies on her birthday and must right her wrongs to gain entry into the afterlife.",
    "Bruised (2 hr 12 min): A disgraced MMA fighter seeks redemption both in the ring and in her personal life.",
    "The Power of the Dog (2 hr 8 min): In 1920s Montana, a charismatic rancher tears into the lives of his brother's new wife and son.",
    "Extraction (1 hr 57 min): A black ops mercenary takes on a perilous mission in Bangladesh to rescue a kidnapped boy.",
    "The Old Guard (2 hr 5 min): A covert group of immortal mercenaries fights to keep their identities secret as they discover a new member.",
    "Project Power (1 hr 53 min): On the streets of New Orleans, a pill that gives users unpredictable superpowers sweeps the city.",
    "Ma Rainey's Black Bottom (1 hr 34 min): Tensions rise during a 1927 recording session as a legendary blues singer battles her ambitious horn player.",
    "Pieces of a Woman (2 hr 6 min): A tragic home birth leaves a woman grappling with profound grief and a fractured relationship.",
    "Red Notice (1 hr 58 min): An FBI profiler reluctantly teams up with a renowned art thief to catch an elusive criminal.",
    "Don't Look Up (2 hr 18 min): Two astronomers embark on a media tour to warn the world of a comet set to destroy Earth.",
    "The Electric State (2 hr 5 min): An orphaned teen travels across a post-apocalyptic America with her robot companion in search of her brother.",
    "The Sea Beast (1 hr 59 min): A young girl stows away on the ship of a legendary monster hunter, changing the course of history.",
    "Glass Onion: A Knives Out Mystery (2 hr 19 min): Detective Benoit Blanc returns to untangle mysteries at a billionaire’s private Greek retreat.",
    "The Gray Man (2 hr 2 min): The CIA’s most skilled mercenary becomes a prime target after uncovering agency secrets.",
    "Frankenstein (TBD 2025): Guillermo del Toro’s horror-fantasy adaptation of the gothic novel, blending tragedy and monster myth.",
    "In Your Dreams (TBD 2025): An animated adventure following a young child’s journey through wondrous and surreal dreamscapes.",
    "Troll 2 (TBD 2025): The giant Norwegian troll is back for another action-packed, mythic international escapade."
    ]
    result = []
    for movie in content:
          title_part, description = movie.split(':', 1)
          # Clean title: remove everything from '(' onwards
          title = title_part.split('(')[0].strip()
          result.append({
              'title': title,
              'description': description.strip(),
              'content': movie  # Keep full content for embedding
          })
        
    return result
