/* eslint no-param-reassign: "error" */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FaSpinner, MdStar } from 'react-icons/all';
import { bindActionCreators } from 'redux';
import { MdAddShoppingCart } from 'react-icons/md';
import Container from '../../components/Container';
import { ComicList, Loading, Button, Star } from './styles';

import { formatPrice } from '../../util/format';

import api from '../../services/api';
import KeyMarvel from '../../services/keymarvel';

import * as CardActions from '../../store/modules/cart/actions';
import * as FavoriteActions from '../../store/modules/favorite/actions';

class Favorite extends Component {
  state = {
    comics: [],
    loading: true,
  };

  async componentDidMount() {
    await this.loadComics();
  }

  loadComics = async () => {
    const { favorite } = this.props;

    const result = await Promise.all(
      favorite.map(item => {
        return api.get(`/comics`, {
          params: {
            ...KeyMarvel.getApiParams(),
            id: item,
          },
        });
      })
    );

    const comics = result.map(comic => ({
      ...comic.data.data.results[0],
      priceFormat: formatPrice(comic.data.data.results[0].prices[0].price),
    }));

    this.setState({
      comics,
      loading: false,
    });
  };

  handleAddComic = item => {
    const { addToCart } = this.props;
    addToCart(item);
  };

  handleStarComic = async item => {
    const { flagFavorite } = this.props;
    const { comics } = this.state;
    flagFavorite(item);

    const comicsOld = comics.filter(value => value.id !== item.id);

    this.setState({ comics: comicsOld });
  };

  render() {
    const { comics, loading } = this.state;
    const { amount } = this.props;

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
              <Star>
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
                  <span>Add ao cart </span>
                </div>
              </Button>
            </li>
          ))}
        </ComicList>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  amount: state.cart.reduce((amount, item) => {
    amount[item.id] = item.amount;
    return amount;
  }, {}),
  favorite: state.favorite,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({ ...CardActions, ...FavoriteActions }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Favorite);
