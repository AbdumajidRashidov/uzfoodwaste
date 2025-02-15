import React, {useState} from 'react';
import {View, Text, FlatList, ScrollView, TouchableOpacity} from 'react-native';
import {responsiveWidth} from 'react-native-responsive-dimensions';

import {useAppDispatch} from '../../hooks';
import {components} from '../../components';
import {useAppNavigation} from '../../hooks';
import {theme, reviews} from '../../constants';
import {setScreen} from '../../store/slices/tabSlice';
import BottomTabBar from '../../navigation/BottomTabBar';
import {
  useGetProductsQuery,
  useGetCarouselQuery,
  useGetCategoriesQuery,
} from '../../store/slices/apiSlice';

const Home: React.FC = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigation = useAppNavigation();

  const {
    data: carouselData,
    error: carouselError,
    isLoading: carouselLoading,
  } = useGetCarouselQuery();

  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetCategoriesQuery();

  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
  } = useGetProductsQuery();

  const dishes = productsData instanceof Array ? productsData : [];
  const carousel = carouselData instanceof Array ? carouselData : [];
  const categories = categoriesData instanceof Array ? categoriesData : [];
  const recommended = dishes?.filter((e) => e.is_recommended) ?? [];

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  const updateCurrentSlideIndex = (e: any): void => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / theme.sizes.width);
    setCurrentSlideIndex(currentIndex);
  };

  const renderStatusBar = () => {
    return <components.StatusBar />;
  };

  const renderHeader = () => {
    return (
      <components.Header
        basket={true}
        user={true}
        userImage={true}
        userName={true}
      />
    );
  };

  const renderCarousel = () => {
    const renderCarouselImages = () => {
      return (
        <FlatList
          data={carousel}
          onMomentumScrollEnd={(e) => updateCurrentSlideIndex(e)}
          renderItem={({item}) => (
            <components.Image
              source={{uri: item.image}}
              style={{width: theme.sizes.width, height: 250, aspectRatio: 1.5}}
            />
          )}
          pagingEnabled={true}
          keyExtractor={(item) => item.id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          decelerationRate={0}
          bounces={false}
          alwaysBounceHorizontal={false}
        />
      );
    };

    const renderIndicator = () => {
      if (carousel.length > 1) {
        return (
          <View
            style={{
              height: 24,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              bottom: 20,
              flexDirection: 'row',
              alignSelf: 'center',
            }}
          >
            {carousel.map((image, index, array) => {
              return (
                <View
                  key={index}
                  style={{
                    width: 8,
                    height: currentSlideIndex === index ? 20 : 8,
                    borderRadius: 8 / 2,
                    backgroundColor: theme.colors.white,
                    opacity: currentSlideIndex === index ? 1 : 0.5,
                    borderColor:
                      currentSlideIndex === index
                        ? theme.colors.mainColor
                        : '#DBE9F5',
                    marginHorizontal: 4,
                  }}
                />
              );
            })}
          </View>
        );
      }
      return null;
    };

    if (carousel.length > 0) {
      return (
        <View style={{marginBottom: 30}}>
          {renderCarouselImages()}
          {renderIndicator()}
        </View>
      );
    }

    if (carousel.length === 0) {
      return null;
    }
  };

  const renderCategories = () => {
    if (categories.length > 0) {
      return (
        <View style={{marginBottom: 30}}>
          <components.BlockHeading
            title='We offer'
            onPress={() => {
              dispatch(setScreen('Menu'));
            }}
            containerStyle={{marginHorizontal: 20, marginBottom: 14}}
          />
          <FlatList
            data={categories}
            horizontal={true}
            contentContainerStyle={{paddingLeft: 20}}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            pagingEnabled={true}
            decelerationRate={0}
            renderItem={({item}) => {
              const lastItem = categories[categories.length - 1];
              return (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Menulist', {
                      category: item.name,
                    });
                  }}
                >
                  <components.ImageBackground
                    source={{uri: item.image}}
                    style={{
                      width: 90,
                      height: 90,
                      paddingVertical: 10,
                      paddingHorizontal: 15,
                      marginRight: item.id === lastItem.id ? 20 : 10,
                      justifyContent: 'flex-end',
                    }}
                    resizeMode='cover'
                    imageStyle={{borderRadius: 10}}
                  >
                    <Text
                      style={{
                        ...theme.fonts.DMSans_400Regular,
                        fontSize: 10,
                        color: theme.colors.mainColor,
                      }}
                    >
                      {item.name}
                    </Text>
                  </components.ImageBackground>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      );
    }

    return null;
  };

  const renderRecommended = () => {
    const slice = recommended?.slice(0, 12);

    if (recommended.length > 0) {
      return (
        <View style={{marginBottom: 30}}>
          <components.BlockHeading
            title='Recommended for you'
            containerStyle={{marginHorizontal: 20, marginBottom: 14}}
          />
          <FlatList
            data={slice}
            horizontal={true}
            contentContainerStyle={{paddingLeft: 20}}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            pagingEnabled={true}
            snapToInterval={theme.sizes.width - responsiveWidth(44.2)}
            decelerationRate={0}
            renderItem={({item, index}) => {
              const lastItem = index === slice.length - 1;
              return (
                <components.RecommendedItem item={item} lastItem={lastItem} />
              );
            }}
          />
        </View>
      );
    }

    if (recommended.length === 0) {
      return null;
    }
  };

  const renderReviews = () => {
    const slice = reviews?.slice(0, 12);

    return (
      <View style={{marginBottom: 20}}>
        <components.BlockHeading
          title='Our Happy clients say'
          onPress={() => {
            navigation.navigate('Reviews');
          }}
          containerStyle={{marginHorizontal: 20, marginBottom: 14}}
        />
        <FlatList
          data={slice}
          horizontal={true}
          contentContainerStyle={{paddingLeft: 20}}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          pagingEnabled={true}
          snapToInterval={theme.sizes.width - 54}
          decelerationRate={0}
          renderItem={({item, index}) => {
            const last = index === reviews.length - 1;
            return <components.ReviewItem item={item} last={last} />;
          }}
        />
      </View>
    );
  };

  const renderContent = () => {
    if (carouselLoading || categoriesLoading || productsLoading) {
      return <components.Loader />;
    }
    return (
      <ScrollView
        contentContainerStyle={{flexGrow: 1, paddingTop: 6}}
        showsVerticalScrollIndicator={false}
      >
        {renderCarousel()}
        {renderCategories()}
        {renderRecommended()}
        {renderReviews()}
      </ScrollView>
    );
  };

  const renderBottomTabBar = () => {
    return <BottomTabBar />;
  };

  const renderHomeIndicator = () => {
    return <components.HomeIndicator />;
  };

  return (
    <components.SmartView>
      {renderStatusBar()}
      {renderHeader()}
      {renderContent()}
      {renderBottomTabBar()}
      {renderHomeIndicator()}
    </components.SmartView>
  );
};

export default Home;
