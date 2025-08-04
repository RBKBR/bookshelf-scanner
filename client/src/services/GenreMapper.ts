export class GenreMapper {
  private readonly genreMapping: Record<string, string[]> = {
    'Fiction': [
      'fiction', 'novel', 'literary fiction', 'contemporary fiction',
      'historical fiction', 'romance', 'mystery', 'thriller', 'crime',
      'fantasy', 'science fiction', 'horror', 'adventure'
    ],
    'Science': [
      'science', 'physics', 'chemistry', 'biology', 'mathematics',
      'astronomy', 'medicine', 'engineering', 'technology', 'research'
    ],
    'History': [
      'history', 'historical', 'biography', 'autobiography', 'memoir',
      'world history', 'american history', 'european history', 'ancient history'
    ],
    'Business': [
      'business', 'economics', 'finance', 'management', 'marketing',
      'entrepreneurship', 'leadership', 'investing', 'career'
    ],
    'Technology': [
      'computer science', 'programming', 'software', 'technology',
      'internet', 'web development', 'artificial intelligence', 'data'
    ],
    'Philosophy': [
      'philosophy', 'ethics', 'logic', 'metaphysics', 'political philosophy',
      'moral philosophy', 'eastern philosophy', 'western philosophy'
    ],
    'Art': [
      'art', 'painting', 'sculpture', 'photography', 'design',
      'architecture', 'music', 'film', 'theater', 'dance'
    ],
    'Health': [
      'health', 'fitness', 'nutrition', 'diet', 'wellness',
      'mental health', 'psychology', 'self-help', 'medical'
    ],
    'Travel': [
      'travel', 'geography', 'culture', 'guidebook', 'adventure travel'
    ],
    'Children': [
      'children', 'juvenile', 'young adult', 'picture book',
      'educational', 'kids'
    ]
  };

  mapCategoriesToGenre(categories: string[]): string {
    if (!categories || categories.length === 0) {
      return 'Other';
    }

    // Convert categories to lowercase for matching
    const lowerCategories = categories.map(cat => cat.toLowerCase());

    // Find the best matching genre
    for (const [genre, keywords] of Object.entries(this.genreMapping)) {
      for (const keyword of keywords) {
        if (lowerCategories.some(cat => cat.includes(keyword))) {
          return genre;
        }
      }
    }

    // If no match found, return the first category or 'Other'
    return categories[0] || 'Other';
  }

  mapSubjectsToGenre(subjects: string[]): string {
    return this.mapCategoriesToGenre(subjects);
  }

  // Map Dewey Decimal Classification to genre
  mapDeweyToGenre(deweyClass: string): string {
    if (!deweyClass) return 'Other';

    const deweyNum = parseInt(deweyClass);
    
    if (deweyNum >= 0 && deweyNum < 100) return 'Philosophy';
    if (deweyNum >= 100 && deweyNum < 200) return 'Philosophy';
    if (deweyNum >= 200 && deweyNum < 300) return 'Philosophy'; // Religion
    if (deweyNum >= 300 && deweyNum < 400) return 'Business'; // Social sciences
    if (deweyNum >= 400 && deweyNum < 500) return 'Other'; // Language
    if (deweyNum >= 500 && deweyNum < 600) return 'Science';
    if (deweyNum >= 600 && deweyNum < 700) return 'Technology';
    if (deweyNum >= 700 && deweyNum < 800) return 'Art';
    if (deweyNum >= 800 && deweyNum < 900) return 'Fiction'; // Literature
    if (deweyNum >= 900 && deweyNum < 1000) return 'History';

    return 'Other';
  }
}
