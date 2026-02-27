"""
Quick test of prompt templates to find the best one.
"""

import asyncio
from main import generate_explanation
from prompts import PROMPT_TEMPLATES

# Test data
TEST_MOVIE = {
    'title': 'The Mitchells vs. The Machines',
    'description': 'An ordinary family becomes humanity\'s last hope during a tech apocalypse in this animated adventure.',
    'content': 'The Mitchells vs. The Machines (1 hr 54 min): An ordinary family becomes humanity\'s last hope during a tech apocalypse in this animated adventure.'
}

TEST_GROUP = {
    "Ahmed": {
        "What's your mood for tonight?": "Light & uplifting",
        "What's your ideal movie length?": "90-120 minutes",
        "What's your favorite movie genre?": "Action & Adventure",
        "How do you feel about plot twists?": "Love unexpected surprises",
        "Do you prefer movies that make you think or feel?": "Thought-provoking & complex"
    },
    "Ammu": {
        "What's your mood for tonight?": "Light & uplifting",
        "What's your ideal movie length?": "90-120 minutes",
        "What's your favorite movie genre?": "Comedy & Romance",
        "How do you feel about plot twists?": "Prefer straightforward stories",
        "Do you prefer movies that make you think or feel?": "Emotionally moving"
    }
}

async def test_templates():
    print("Testing Prompt Templates\n")
    print(f"Movie: {TEST_MOVIE['title']}")
    print(f"Group: {', '.join(TEST_GROUP.keys())}\n")
    print("=" * 80 + "\n")

    for template_name in PROMPT_TEMPLATES.keys():
        print(f"TEMPLATE: {template_name.upper()}")
        print("-" * 40)

        try:
            explanation = await generate_explanation(TEST_MOVIE, TEST_GROUP, template_name)
            print(f"{explanation}\n")
        except Exception as e:
            print(f"Error: {e}\n")

if __name__ == "__main__":
    asyncio.run(test_templates())