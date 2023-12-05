import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
} from "react-native";
import LottieView from "lottie-react-native";
import { Audio } from "expo-av";

import { AppRegistry } from "react-native";
import {
  MD3LightTheme,
  MD3DarkTheme,
  PaperProvider,
  Text,
  useTheme,
  Button,
} from "react-native-paper";
import { name as appName } from "./app.json";
import { useEffect, useState } from "react";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const { width, height } = Dimensions.get("screen");

const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
  },
};

const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
  },
};

function Circle() {
  const theme = useTheme();

  return (
    <View
      style={[styles.circle, { borderColor: theme.colors.onPrimary }]}
    ></View>
  );
}

function X() {
  const theme = useTheme();
  return (
    <View>
      <View
        style={[
          styles.line,
          {
            borderColor: theme.colors.error,
            transform: [{ rotate: "45deg" }],
          },
        ]}
      ></View>
      <View
        style={[
          styles.line,
          {
            borderColor: theme.colors.error,
            transform: [{ rotate: "-45deg" }],
          },
        ]}
      ></View>
    </View>
  );
}

export default function App() {
  const theme = useColorScheme() === "dark" ? DarkTheme : LightTheme;

  const [player, setPlayer] = useState(true);
  const [winner, setWinner] = useState(null);
  const [sound, setSound] = useState(null);

  const [board, setBoard] = useState([
    { id: 1, flag: null },
    { id: 2, flag: null },
    { id: 3, flag: null },
    { id: 4, flag: null },
    { id: 5, flag: null },
    { id: 6, flag: null },
    { id: 7, flag: null },
    { id: 8, flag: null },
    { id: 9, flag: null },
  ]);

  useEffect(() => {
    checkWinner();
  }, [board]);

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require("./assets/winner.mp3")
    );
    setSound(sound);

    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  function checkWinner() {
    [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
      [1, 5, 9],
      [3, 5, 7],
    ].forEach((list) => {
      const [a, b, c] = list;
      const flagA = board[a - 1]?.flag;
      const flagB = board[b - 1]?.flag;
      const flagC = board[c - 1]?.flag;

      if (
        flagA !== null &&
        flagA !== undefined &&
        flagA === flagB &&
        flagA === flagC
      ) {
        setWinner(player);
        playSound();
      }
    });
  }

  function resetBoard() {
    setWinner(null);
    setBoard((prev) =>
      prev.map((boardItem) => boardItem.id && { ...boardItem, flag: null })
    );
  }

  return (
    <PaperProvider theme={theme}>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View
          style={{
            padding: 8,
            paddingHorizontal: 16,
            marginBottom: 64,
            borderRadius: 12,
            backgroundColor: theme.colors.onPrimary,
          }}
        >
          <Text variant="headlineLarge">
            {winner !== null
              ? `Winner : ${!winner ? "X" : "O"}`
              : `Player: ${player ? "X" : "O"}`}
          </Text>
        </View>
        <FlatList
          data={board}
          numColumns={3}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.box,
                [1, 4, 7].includes(item.id) && { borderLeftWidth: 0 },
                [1, 2, 3].includes(item.id) && { borderTopWidth: 0 },
                [7, 8, 9].includes(item.id) && {
                  borderBottomWidth: 0,
                },
                [3, 6, 9].includes(item.id) && {
                  borderRightWidth: 0,
                },
                { borderColor: theme.colors.onBackground },
              ]}
              onPress={() => {
                if (item.flag === null) {
                  setBoard((prev) =>
                    prev.map((boardItem) =>
                      boardItem.id === item.id
                        ? { ...boardItem, flag: player }
                        : boardItem
                    )
                  );
                  checkWinner();
                  setPlayer(!player);
                }
              }}
            >
              {item.flag !== null && (item.flag ? <X /> : <Circle />)}
            </TouchableOpacity>
          )}
          justifyContent="center"
          alignItems="center"
          style={{
            width: 300,
            height: 300,
            flexGrow: 0,
          }}
        />
        {winner !== null && (
          <LottieView
            autoPlay
            style={{
              width: width,
              height: height,
              position: "absolute",

              alignItems: "center",
              justifyContent: "center",
            }}
            // Find more Lottie files at https://lottiefiles.com/featured
            source={require("./assets/Celebration.json")}
          />
        )}
        <View style={{ marginTop: 48 }}>
          <Button mode="contained" onPress={resetBoard}>
            Reset
          </Button>
        </View>
        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: 100,
    height: 100,
    borderWidth: 1,

    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 50,
    height: 50,
    borderWidth: 5,
    borderRadius: 25,
  },
  line: {
    width: 50,
    borderWidth: 3,
    borderRadius: 25,

    position: "absolute",
    left: -25,
  },
});

AppRegistry.registerComponent(appName, () => App);
