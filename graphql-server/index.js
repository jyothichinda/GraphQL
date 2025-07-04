const { ApolloServer, gql } = require("apollo-server");
const pool = require("./db");

let books = [
  {
    id: "1",
    title: "Clean Code",
    author: "Robert C. Martin",
    genre: "Technology",
    publishedYear: 2001,
  },
  {
    id: "2",
    title: "The Pragmatic Programmer",
    author: "Andy Hunt",
    genre: "Software Engineering",
    publishedYear: 1999,
  },
];

const typeDefs = gql`
  type Book {
    id: ID!
    title: String
    author: String
    genre: String
    publishedYear: Int
  }

  type Query {
    books: [Book]
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      genre: String
      publishedYear: Int
    ): Book
  }
`;

const resolvers = {
  Query: {
    books: () => books,
  },
  Mutation: {
    addBook: (_, { title, author, genre, publishedyear }) => {
      const newBook = {
        id: Date.now().toString(),
        title,
        author,
        genre,
        publishedyear,
      };
      books.push(newBook);
      return newBook;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(` Server ready at ${url}`);
});
