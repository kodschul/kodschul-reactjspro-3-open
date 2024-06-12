import React, {useState} from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useQuery} from 'react-query';

const Characters = () => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');

  const fetchCharacters = ({queryKey}) => {
    const [_key, {page}] = queryKey;
    return fetch(`https://rickandmortyapi.com/api/character?page=${page}`).then(
      res => res.json(),
    );
  };

  const {data, isLoading, error} = useQuery(
    ['characters', {page}],
    fetchCharacters,
    {
      keepPreviousData: true,
    },
  );

  const sortCharacters = characters => {
    return characters.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'species') {
        return a.species.localeCompare(b.species);
      }
    });
  };

  if (isLoading)
    return (
      <View>
        <Text>Loading..</Text>
      </View>
    );
  if (error)
    return (
      <View>
        <Text>An error has occurred: {error.message}</Text>
      </View>
    );

  const sortedCharacters = data ? sortCharacters([...data.results]) : [];

  return (
    <View style={{paddingTop: 50}}>
      <FlatList
        data={sortedCharacters}
        numColumns={2}
        renderItem={({item: character}) => {
          return (
            <TouchableOpacity onPress={() => alert('Clicked!')}>
              <View>
                <Image
                  source={{uri: character.image}}
                  style={{width: 100, height: 100}}
                />

                <View>
                  <Text>{character.name}</Text>
                </View>

                <View>
                  <Text>{character.species}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default Characters;
