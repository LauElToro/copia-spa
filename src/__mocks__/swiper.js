// Mock for Swiper components and modules
import React from 'react';
import PropTypes from 'prop-types';

export const Swiper = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'swiper' }, children);
};

Swiper.propTypes = {
  children: PropTypes.node,
};

export const SwiperSlide = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'swiper-slide' }, children);
};

SwiperSlide.propTypes = {
  children: PropTypes.node,
};

export const Navigation = {};
export const Pagination = {};
export const Autoplay = {};

const SwiperMock = {};
export default SwiperMock;