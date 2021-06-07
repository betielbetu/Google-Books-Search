import axios from 'axios';
import {encodeGetParams} from '../helpers/misc.helpers';

class BooksApi {
     URL = 'https://www.googleapis.com/books/v1/volumes';
     APIKEY = 'AIzaSyDQfuLjYqTbFe8meDHbKOYH3t9btt3XiQ4';

     async searchBooks(title, index) {
     	if (!title) {
     		return Promise.resolve(null);
     	}
     	const apiParams = {key: this.APIKEY, q: title, startIndex: index};
     	const apiCall = `${this.URL}?${encodeGetParams(apiParams)}`;
     	return axios.get(apiCall);
     }
}

export default BooksApi;
