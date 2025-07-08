import React, { useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  useMutation,
  gql,
} from "@apollo/client";
import {
  MdDeleteOutline,
  MdOutlineStarOutline,
  MdLibraryBooks,
  MdBook,
} from "react-icons/md";
import { BiBook, BiSolidBookAdd } from "react-icons/bi";
import { BsPersonVcardFill } from "react-icons/bs";
import { FaRegCalendarAlt, FaRegTrashAlt } from "react-icons/fa";
import { IoIosHeart } from "react-icons/io";

// Apollo Client Setup
const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

// GraphQL Operations
const GET_BOOKS = gql`
  query GetBooks {
    books {
      id
      title
      author
      genre
      publishedYear
    }
  }
`;

const ADD_BOOK = gql`
  mutation AddBook(
    $title: String!
    $author: String!
    $genre: String
    $publishedYear: Int
  ) {
    addBook(
      title: $title
      author: $author
      genre: $genre
      publishedYear: $publishedYear
    ) {
      id
      title
      author
      genre
      publishedYear
    }
  }
`;

const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id) {
      id
    }
  }
`;

const Books = () => {
  const { loading, error, data, refetch } = useQuery(GET_BOOKS);
  const [addBook, { loading: addLoading }] = useMutation(ADD_BOOK);
  const [deleteBook] = useMutation(DELETE_BOOK);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [publishedYear, setPublishedYear] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    try {
      await addBook({
        variables: {
          title: title.trim(),
          author: author.trim(),
          genre: genre.trim() || null,
          publishedYear: publishedYear ? parseInt(publishedYear) : null,
        },
        // Optimistic update
        optimisticResponse: {
          addBook: {
            id: Date.now().toString(),
            title: title.trim(),
            author: author.trim(),
            genre: genre.trim() || null,
            publishedYear: publishedYear ? parseInt(publishedYear) : null,
            __typename: "Book",
          },
        },
        // Update cache after mutation
        update: (cache, { data: { addBook } }) => {
          const existing = cache.readQuery({ query: GET_BOOKS });
          cache.writeQuery({
            query: GET_BOOKS,
            data: {
              books: [...existing.books, addBook],
            },
          });
        },
      });

      // Clear form
      setTitle("");
      setAuthor("");
      setGenre("");
      setPublishedYear("");
    } catch (err) {
      console.error("Error adding book:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBook({
        variables: { id },
        // Update cache after deletion
        update: (cache) => {
          const existing = cache.readQuery({ query: GET_BOOKS });
          cache.writeQuery({
            query: GET_BOOKS,
            data: {
              books: existing.books.filter((book) => book.id !== id),
            },
          });
        },
      });
    } catch (err) {
      console.error("Error deleting book:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                <MdLibraryBooks />
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GraphQL BookVault
              </h1>
              <p className="text-gray-600 text-sm">
                Learn GraphQL with Apollo Client
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Add Book Card */}
        <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex flex-row items-center justify-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {" "}
                <BiSolidBookAdd />
                Add New Book
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Book Title *
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter an amazing book title..."
                  required
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="author"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Author Name *
                </label>
                <input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Enter the author's name..."
                  required
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="genre"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Genre
                </label>
                <input
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g., Fiction, Non-fiction, Mystery..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="year"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Published Year
                </label>
                <input
                  id="year"
                  type="number"
                  value={publishedYear}
                  onChange={(e) => setPublishedYear(e.target.value)}
                  placeholder="e.g., 2023"
                  min="1000"
                  max="2024"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={addLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="flex items-center justify-center gap-2">
                {addLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding to GraphQL...
                  </>
                ) : (
                  <>
                    <span className="text-lg">✨</span>
                    Add to Library
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Books Library */}
        <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">
                <BiBook />
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Your GraphQL Library
            </h2>
            {data?.books && (
              <div className="ml-auto bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {data.books.length} {data.books.length === 1 ? "book" : "books"}
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Fetching books from GraphQL...</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <div className="text-red-400 text-4xl mb-2">⚠️</div>
              <p className="text-red-700 font-medium">GraphQL Error</p>
              <p className="text-red-600 text-sm mb-4">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry Query
              </button>
            </div>
          ) : !data?.books?.length ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                <MdBook />
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">
                Your GraphQL library is empty
              </p>
              <p className="text-gray-500">
                Add your first book using the mutation above!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/30 bg-white/20 backdrop-blur-sm">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b border-white/30">
                      <MdBook /> Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b border-white/30">
                      <BsPersonVcardFill /> Author
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b border-white/30">
                      <MdBook /> Genre
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b border-white/30">
                      <FaRegCalendarAlt /> Year
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b border-white/30">
                      <MdOutlineStarOutline /> Rating
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 border-b border-white/30">
                      <FaRegTrashAlt /> Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {data.books.map((book, idx) => (
                    <tr
                      key={book.id}
                      className={`${
                        idx % 2 === 0 ? "bg-white/10" : "bg-white/20"
                      } hover:bg-white/30 transition-all duration-300`}
                    >
                      <td className="px-6 py-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-10 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-md flex items-center justify-center shadow-sm">
                            <span className="text-white text-sm">
                              <MdBook />
                            </span>
                          </div>
                          <span className="font-semibold text-gray-800">
                            {book.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium border-b border-white/10">
                        {book.author}
                      </td>
                      <td className="px-6 py-4 border-b border-white/10">
                        {book.genre ? (
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {book.genre}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">
                            Not specified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 border-b border-white/10">
                        {book.publishedYear ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {book.publishedYear}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4 border-b border-white/10">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">
                            <MdOutlineStarOutline />
                          </span>
                          <span className="text-yellow-400">
                            <MdOutlineStarOutline />
                          </span>
                          <span className="text-yellow-400">
                            <MdOutlineStarOutline />
                          </span>
                          <span className="text-yellow-400">
                            <MdOutlineStarOutline />
                          </span>
                          <span className="text-yellow-400">
                            <MdOutlineStarOutline />
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border-b border-white/10">
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors hover:shadow-md"
                          title="Delete book"
                        >
                          <MdDeleteOutline />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-6 py-8 text-center">
        <p className="text-gray-500 text-sm">
          Built with <IoIosHeart /> using GraphQL & Apollo Client
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <ApolloProvider client={client}>
      <Books />
    </ApolloProvider>
  );
}

export default App;
