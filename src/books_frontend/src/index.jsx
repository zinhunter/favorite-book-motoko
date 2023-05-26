import * as React from "react";
import { render } from "react-dom";

//Backend stuff
import { books_backend } from "../../declarations/books_backend";

//Asset stuff
import "../assets/main.css";

const MyHello = () => {
  const [name, setName] = React.useState('');
  const [selectedBook, setSelectedBook] = React.useState('');
  const [saveLoading, setSaveLoading] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [bookSearchList, setBookSearchList] = React.useState([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  
  const [error, setError] = React.useState(false);

  const [favorites, setFavorites] = React.useState([]);

  React.useEffect(() => {
    setError(false);

    async function fetchData() {
      try {
        const favList = await books_backend.getAllBooks();
        setFavorites(favList);
      } catch {
        setError(true);
      }
    }

    fetchData();
  }, [])
  
  const handleSubmitSearch = async (e) => {
    e.preventDefault();
    setError(false);
    setSearchLoading(true);

    try {
      const bookList = await books_backend.searchBook(searchQuery.trim().split(' '));
      const parsedList = JSON.parse(bookList);

      setBookSearchList(parsedList.docs);
      
    } catch {
      setError(true);
    }

    setSearchLoading(false);
  }

  const handleSubmitBook = async (e) => {
    e.preventDefault();
    setError(false);
    setSaveLoading(true);
    
    const jsonUrl = selectedBook + '.json';

    try {
      await books_backend.addBook(name, jsonUrl);
      
      const favList = await books_backend.getAllBooks();
      setFavorites(favList);
    } catch {
      setError(true);
    }

    setSaveLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-200 ">
      <div className="flex space-x-4 items-center justify-center my-4">
        <div className="bg-red-500 h-20 w-20 rounded-md flex items-center justify-center">
          <p>:D</p>
        </div>
        <div className="flex flex-col justify-start">
          <p className="h4 text-3xl">Favorite Book</p>
          <p className="font-medium text-xs">A dApp by Ayrton Klassen</p>
        </div>
      </div>
      <p hidden={!error} className="text-xs text-red-500">There was an error, please retry.</p>
      <form onSubmit={handleSubmitBook} className="flex flex-col items-center">
        <label className="text-xs" htmlFor="name">Please enter your name:</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required/>
        
        <label className="text-xs" htmlFor="book">Please input your book url or use the search function:</label>
        <input id="book" value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)} placeholder="Eg.: https://openlibrary.org/works/OL82586W" required/>

        <button disabled={saveLoading} type="submit" className="block bg-red-500 text-white font-bold rounded-md">
          {saveLoading ? 'Loading' : 'Save to the Blockchain.'}
        </button>
      </form>
      <form className="flex flex-col items-center" onSubmit={handleSubmitSearch}>
        <label className="text-xs" htmlFor="search">Search for your favorite book:</label>
        <input id="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Eg.: Harry Potter" required/>
        <button type="submit" disabled={searchLoading} className="block bg-red-500 text-white font-bold rounded-md">
          { searchLoading ? 'Loading' : 'Search'}
        </button>
      </form>
      <div>
        {bookSearchList.map((book, index) => {
          return (
            <div key={book.key} className="flex items-center justify-between border-2 border-red-500 space-x-2 p-2 rounded-md bg-gray-300 mb-2">
              <div className="flex items-center">
                <div>
                  <p className="text-lg font-bold">{book.title}</p>
                  <p className="text-sm">{book.author_name ? book.author_name[0] : 'No author'}</p>
                </div>
              </div>
              <button className="bg-red-500 rounded-md text-xs text-white font-bold p-2" onClick={() => { setSelectedBook(`https://openlibrary.org` + book.key); setBookSearchList([]) }}>
                Select
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col">
        <p className="text-md font-bold">Favorite books</p>
        <div>
        {favorites.map((book, index) => {
          const parsedBook = JSON.parse(book[1]);

          return (
            <div key={index} className="flex flex-col items-center whitespace-pre-wrap w-96 justify-start border-2 border-red-500 space-x-2 p-2 rounded-md bg-gray-300 mb-2">
              <p className="text-sm font-bold">{book[0]}'s favorite book is:</p>
              <div className="flex items-center">
                <div>
                  <p className="text-lg font-bold">{parsedBook.title}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      </div>
    </div>
  );
};

render(<MyHello />, document.getElementById("app"));