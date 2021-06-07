import React, {Component} from 'react';
import {Button, Col, Form, Row} from 'react-bootstrap';
import BooksApi from '../../api/books.api';
import {BookErrors} from '../../shared/messages.error';
import BookModel from '../../model/book.model';
import {connect} from 'react-redux';
import AppList from '../../components/list/list';
import {setFavorites, updateBooks} from "../../redux/actions";
import BookCollection from "../../model/bookcollection.model";
import paginationService from "../../services/pagination.service";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import {withStyles} from "@material-ui/core/styles";
import FavoriteApi from "../../api/favorite.api";
import './home.css';

const mapStateToProps = (state) => {
	const storeProps = {};
	for (const [key, value] of Object.entries(state)) {
		storeProps[key] = value;
	}
	return {
		storeProps
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateBooks: (bookUpdate) => new Promise((resolve, reject) => {
		dispatch(updateBooks(bookUpdate));
		resolve();
	}),
	setFavorites: (favorites) => {
		dispatch(setFavorites(favorites))
	}
});

const useStyles = theme => ({
	grow: {
		flexGrow: 1,
	},
	title: {
		display: 'none',
		[theme.breakpoints.up('sm')]: {
			display: 'block',
		},
	},
	search: {
		position: 'relative',
		borderRadius: theme.shape.borderRadius,
		marginRight: theme.spacing(2),
		marginLeft: 0,
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			marginLeft: theme.spacing(3),
			width: 'auto',
		},
	}
});

class AppHome extends Component {
     state = {
     	error: false,
     	fetchingBooks: false,
     	searchValue: '',
     	errorMessage: '',
     	oldSearchValue: '',
     	defaultCollection: 'books_home',
     	resultsPerPage: 10,
     	currentPage: 1,
     	collectionSearch: '',
     };

     constructor(props) {
     	super(props);
     	this.booksApi = new BooksApi();
     	this.favoriteApi = new FavoriteApi();
     }

     captureSearchValue(event) {
     	this.setState({searchValue: event.target.value, collectionSearch: event.target.value});
     }

     keyPressed(event) {
     	if (event.key === 'Enter') {
     		this.doSearch();
     	}
     }


     componentDidMount() {
     	this.subscription = paginationService.getPage().subscribe(pageNumber => {
     		this.doSearch(pageNumber);
     	})
     	//get the favorites from the backend
     	this.favoriteApi.getIds()
     		.then((favorites) => {
     			if (!favorites && !favorites.data) {
     				return;
     			}
     			this.props.setFavorites({favorites: favorites.data});
     		});
     	//check to see if our collection has any books from a previous search
     	const currentCollect = this.props.storeProps[this.state.defaultCollection];
     	if (currentCollect && currentCollect.books && currentCollect.books.length > 0) {
     		//get the search value too
     		const bookSearch = currentCollect.bookSearch || '';
     		this.setState({collectionSearch: bookSearch, oldSearchValue: bookSearch, searchValue: bookSearch});
     	}
     }

     componentWillUnmount() {
     	this.subscription.unsubscribe();
     }

     doSearch = (page_number) => {
     	// get collection
     	const currentCollect = this.props.storeProps[this.state.defaultCollection];
     	const bookCollection = currentCollect ? currentCollect : new BookCollection();
     	let currentPage = page_number ? page_number : bookCollection.currentPage;
     	let searchIndex = (currentPage - 1) * this.state.resultsPerPage;
     	const oldSearchValue = this.state.oldSearchValue;
     	this.setState({error: false});

     	const searchValue = this.state.searchValue;
     	if (!searchValue) {
     		this.setState({error: true, errorMessage: BookErrors.nosearch});
     		return;
     	}

     	// reset pagination info on new search
     	if (searchValue !== oldSearchValue) {
     		searchIndex = 0;
     		currentPage = 1;
     	}

     	this.setState({fetchingBooks: true});
     	this.booksApi.searchBooks(searchValue, searchIndex)
     		.then((bookData) => {
     			this.setState({fetchingBooks: false});
     			const bookTotal = bookData && bookData.data && bookData.data.totalItems;
     			const rawBookData = bookData && bookData.data && bookData.data.items;
     			if (!rawBookData) {
     				this.setState({error: true, errorMessage: BookErrors.nobooks});
     				return;
     			}
     			const books = rawBookData.map((x) => new BookModel(x));
     			const pageCount = Math.ceil(bookTotal / this.state.resultsPerPage);
     			this.props.updateBooks({
     				collectionName: this.state.defaultCollection,
     				books: books,
     				pageCount: pageCount > 50 ? 40 : pageCount,
     				currentPage: currentPage,
     				bookSearch: searchValue,
     			}).then(() => {
     				this.setState({error: false, oldSearchValue: searchValue});
     			});

     		});
     }

     render() {
     	const error = this.state.error;
     	const fetchingBooks = this.state.fetchingBooks;
     	const currentCollect = this.props.storeProps[this.state.defaultCollection];
     	const hasBooks = currentCollect && currentCollect.books && currentCollect.books.length > 0;
     	const errorMessage = this.state.errorMessage;
     	const bookCollection = this.state.defaultCollection;
     	const {classes} = this.props;
     	return (
     		<React.Fragment>
     			<Row>
     				<Col>
     					<AppBar position="static">
     						<Toolbar>
     							<IconButton
     								edge="start"
     								className={classes.menuButton}
     								color="inherit"
     								aria-label="open drawer"
     							>
     							</IconButton>
     							<Typography className={classes.title} variant="h6" noWrap>
                                             Search Books
     							</Typography>
     							<div className={classes.search}>
     								<Row className="px-0">
     									<Col sm={8} className="px-0 mr-3">
     										<Form.Control type="email" placeholder="Search"
     											onChange={(e) => this.captureSearchValue(e)}
     											onKeyPress={(e) => this.keyPressed(e)}
     											value={this.state.collectionSearch}/>
     									</Col>
     									<Col sm={3} className="px-0">
     										<Button onClick={(e) =>this.doSearch()} variant="primary" type="button">Search</Button>
     									</Col>
     								</Row>
     							</div>
     							<div className={classes.grow}/>
     						</Toolbar>
     					</AppBar>
     				</Col>
     			</Row>
     			<Row className="mt-2">
     				{hasBooks ? <AppList collectionToUse={bookCollection}/> : fetchingBooks ?
     					<Col className="text-center fetching-books">Searching for books...</Col> :
     					error ? <Col className="text-center error-message">{errorMessage}</Col> : <Col className="mt-5 text-center"><span className="no-books">Type in search to find books</span></Col>}
     			</Row>
     		</React.Fragment>);
     }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles)(AppHome));
