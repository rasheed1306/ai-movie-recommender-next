// Static component - no client-side JS needed for SSG
const staticMovies = [
  { id: 1, title: "The Shawshank Redemption", poster: "shawshank.jpg" },
  { id: 2, title: "The Godfather", poster: "godfather.jpg" },
  { id: 3, title: "The Dark Knight", poster: "dark-knight.jpg" },
  { id: 4, title: "Pulp Fiction", poster: "pulp-fiction.jpg" },
  { id: 5, title: "Forrest Gump", poster: "forrest-gump.jpg" },
  { id: 6, title: "Inception", poster: "inception.jpg" },
  { id: 7, title: "Fight Club", poster: "fight-club.jpg" },
  { id: 8, title: "The Matrix", poster: "matrix.jpg" },
  { id: 9, title: "Goodfellas", poster: "goodfellas.jpg" },
  { id: 10, title: "Interstellar", poster: "interstellar.jpg" },
  { id: 11, title: "The Silence of the Lambs", poster: "silence-lambs.jpg" },
  { id: 12, title: "Saving Private Ryan", poster: "saving-private-ryan.jpg" },
];

export const MoviePosterCarousel = () => {
  // Duplicate movies for seamless loop
  const duplicatedMovies = [...staticMovies, ...staticMovies];

  return (
    <div className="w-full overflow-hidden bg-background/50 py-8">
      <div className="relative">
        <div className="flex animate-scroll-left">
          {duplicatedMovies.map((movie, index) => (
            <div
              key={`${movie.id}-${index}`}
              className="flex-shrink-0 px-3"
            >
              <div className="relative h-64 w-44 overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105">
                <img
                  src={`/movies/${movie.poster}`}
                  alt={movie.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
        {/* Gradient overlays for fade effect */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-background to-transparent"></div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-background to-transparent"></div>
      </div>
    </div>
  );
};
