"""
Prompt templates for movie recommendation explanations.
"""

from typing import Dict

PROMPT_TEMPLATES = {
    "default": """Write a compelling 2-3 sentence explanation for why this group will love this movie.

Movie: {movie_title}
Description: {movie_description}

Group Preferences: {group_text}

Connect the movie to the group's preferences. Be specific, conversational, and enthusiastic.

Explanation:""",

    "conversational": """Hey! Tell this group in 2-3 sentences why this movie is perfect for them.

Movie: {movie_title} - {movie_description}
Group wants: {group_text}

Keep it friendly and match their preferences to the movie.

Explanation:""",

    "balanced": """Explain in 2-3 sentences why this movie works for the whole group.

Movie: {movie_title}
Description: {movie_description}
Group Preferences: {group_text}

Show how the movie addresses different members' preferences while being a cohesive experience.

Explanation:"""
}

DEFAULT_TEMPLATE = "default"


def format_group_preferences(group_preferences: Dict[str, Dict[str, str]]) -> str:
    """Format group preferences into readable text."""
    group_summary = []
    for user, answers in group_preferences.items():
        user_prefs = ", ".join([f"{q.split('?')[0].lower()}: {a.lower()}" for q, a in answers.items()])
        group_summary.append(f"{user} ({user_prefs})")
    
    return "; ".join(group_summary)


def get_prompt(
    template_name: str,
    movie_title: str,
    movie_description: str,
    group_preferences: Dict[str, Dict[str, str]]
) -> str:
    """
    Get a formatted prompt for generating movie explanations.
    
    Args:
        template_name: Name of the template to use (from PROMPT_TEMPLATES keys)
        movie_title: Title of the movie
        movie_description: Description of the movie
        group_preferences: Dictionary of user preferences
        
    Returns:
        Formatted prompt string ready for the LLM
    """
    template = PROMPT_TEMPLATES.get(template_name, PROMPT_TEMPLATES[DEFAULT_TEMPLATE])
    group_text = format_group_preferences(group_preferences)
    
    return template.format(
        movie_title=movie_title,
        movie_description=movie_description,
        group_text=group_text
    )


def list_available_templates() -> list[str]:
    """Return a list of available template names."""
    return list(PROMPT_TEMPLATES.keys())
