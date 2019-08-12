import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FaSpinner, MdStar } from 'react-icons/all';
import { bindActionCreators } from 'redux';
import { MdAddShoppingCart } from 'react-icons/md';
import Container from '../../components/Container';
import { ComicList, PageActions, Loading, Button, Star } from './styles';

import { formatPrice } from '../../util/format';

import api from '../../services/api';
import KeyMarvel from '../../services/keymarvel';

import * as CardActions from '../../store/modules/cart/actions';
import * as FavoriteActions from '../../store/modules/favorite/actions';

class Home extends Component {
  state = {
    comics: [],
    loading: true,
    page: 1,
    offset: 0,
    orderBy: '-modified',
  };

  async componentDidMount() {
    await this.loadComics();
  }

  loadComics = async () => {
    const { offset, page, orderBy } = this.state;

    const param = {
      params: {
        ...{ limit: 6, offset, orderBy },
        ...KeyMarvel.getApiParams(),
      },
    };

    const result = await api.get('/comics', param);

    // FormatPrice
    const comics = result.data.data.results.map(comic => ({
      ...comic,
      priceFormat: formatPrice(comic.prices[0].price),
    }));

    this.setState({
      comics,
      loading: false,
      page,
      offset,
    });
  };

  handleAddComic = item => {
    const { addToCart } = this.props;
    addToCart(item);
  };

  handleStarComic = item => {
    const { flagFavorite } = this.props;
    flagFavorite(item);
  };

  handlePage = async action => {
    let { page, offset } = this.state;

    page = action === 'back' ? page - 1 : page + 1;
    offset = action === 'back' ? offset - 6 : offset + 6;

    await this.setState({ page, offset, loading: true });

    await this.loadComics();
  };

  render() {
    const { comics, loading, page } = this.state;
    const { amount, favorite } = this.props;

    return (
      <Container>
        {!loading || (
          <Loading>
            <FaSpinner size={50} />
          </Loading>
        )}

        <ComicList>
          {comics.map(item => (
            <li key={item.id}>
              <img
                src={`${item.thumbnail.path}.${item.thumbnail.extension}`}
                alt={item.title}
              />
              <strong>{item.title}</strong>
              <Star cor={favorite.indexOf(item.id)}>
                <span>
                  {item.priceFormat} {item.color}
                </span>
                <MdStar onClick={() => this.handleStarComic(item)} size={25} />
              </Star>

              <Button onClick={() => this.handleAddComic(item)}>
                <div>
                  <div>
                    <MdAddShoppingCart size={16} color="#FFF" />
                    {amount[item.id] || 0}
                  </div>
                  <span>Add to cart </span>
                </div>
              </Button>
            </li>
          ))}
        </ComicList>

        <PageActions>
          <button
            type="button"
            disabled={page < 2}
            onClick={() => this.handlePage('back')}
          >
            Back
          </button>
          <span>Page {page}</span>
          <button
            type="button"
            disabled={page === 1 && comics.length === 1}
            onClick={() => this.handlePage('next')}
          >
            Next
          </button>
        </PageActions>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  amount: state.cart.reduce((amount, item) => {
    amount[item.id] = item.amount;
    return amount;
  }, {}),
  favorite: JSON.stringify(state.favorite),
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({ ...CardActions, ...FavoriteActions }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
