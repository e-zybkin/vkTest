import { useState, useEffect, useRef } from "react";
import "./App.css";
import {
  Avatar,
  Button,
  ButtonGroup,
  CustomSelectOption,
  FormItem,
  View,
  Panel,
  Header,
  Group,
  Select,
  SimpleCell,
} from "@vkontakte/vkui";
import "@vkontakte/vkui/dist/vkui.css";
import { GroupInterface } from "./utils/interface";
import { ColorOption } from "./utils/interface";
import * as groupsApi from "./utils/api";

function App() {
  const [allGroups, setAllGroups] = useState<GroupInterface[]>([]);
  const [displayedGroups, setDisplayedGroups] = useState<GroupInterface[]>([]);
  const [showedFriends, setShowedFriends] = useState<number | null>();

  const [closedState, setClosedState] = useState<string>("Все");
  const [colorState, setColorState] = useState<string>("Все");
  const [friendsState, setFriendsState] = useState<string>("Все");

  const timeoutId = useRef<number | null>(null);

  useEffect(() => {
    groupsApi.getGroups().then((res: GroupInterface[]) => {
      setAllGroups(res);
      setDisplayedGroups(res);
    });
  }, []);

  function generateSubtitle(group: GroupInterface): JSX.Element {
    return (
      <span>
        {`${group.members_count} подписчиков`}
        {group.friends && (
          <>
            {" · "}
            <Button
              mode="link"
              onClick={() => showFriends(group.id)}
            >{`${group.friends.length} друзей`}</Button>
          </>
        )}
      </span>
    );
  }

  function showFriends(id: number): void {
    if (showedFriends === id) {
      setShowedFriends(null);
    } else {
      setShowedFriends(id);
    }
  }

  function takeColors(): ColorOption[] {
    const ans = [{ label: "Все", value: "Все", avatar: "" }];
    allGroups.forEach((group) => {
      const color = group.avatar_color;
      const isColorExist = ans.some((item) => item.value === color);
      if (color && !isColorExist) {
        ans.push({ label: color, value: color, avatar: color });
      }
    });
    return ans;
  }

  function handleFilterGroups(t: number) {
    return function (closed: string, color: string, friends: string) {
      clearTimeout(timeoutId.current || 0);
      timeoutId.current = setTimeout(() => {
        setDisplayedGroups(
          allGroups.filter((group) => {
            return (
              (closed === "Все" || group.closed === (closed === "Закрытая")) &&
              (color === "Все" || group.avatar_color === color) &&
              (friends === "Все" ||
                Boolean(group.friends) === (friends === "Есть друзья"))
            );
          })
        );
      }, t);
    };
  }

  const filterGroups = handleFilterGroups(2000);

  return (
    <View activePanel="list">
      <Panel id="list">
        <ButtonGroup mode="horizontal" gap="space" stretched>
          <FormItem top="По наличию друзей" htmlFor="select-friends">
            <Select
              id="select-friends"
              placeholder="Все"
              options={[
                { label: "Есть друзья", value: "Есть друзья" },
                { label: "Нет друзей", value: "Нет друзей" },
                { label: "Все", value: "Все" },
              ]}
              onChange={(event) => {
                const fr = event.target.value;
                setFriendsState(fr);
                filterGroups(closedState, colorState, fr);
              }}
            />
          </FormItem>

          <FormItem top="По типу группы" htmlFor="select-closed">
            <Select
              id="select-closed"
              placeholder="Все"
              options={[
                { label: "Закрытая", value: "Закрытая" },
                { label: "Открытая", value: "Открытая" },
                { label: "Все", value: "Все" },
              ]}
              onChange={(event) => {
                const cl = event.target.value;
                setClosedState(cl);
                filterGroups(cl, colorState, friendsState);
              }}
            />
          </FormItem>

          <FormItem top="По цвету аватарки" htmlFor="select-color">
            <Select
              id="select-color"
              placeholder="Все"
              options={takeColors()}
              renderOption={({ option, ...restProps }) => (
                <CustomSelectOption
                  {...restProps}
                  key={option.value}
                  before={
                    option.avatar ? (
                      <Avatar
                        size={24}
                        style={{ backgroundColor: option.avatar }}
                      />
                    ) : null
                  }
                />
              )}
              onChange={(event) => {
                const col = event.target.value;
                setColorState(col);
                filterGroups(closedState, col, friendsState);
              }}
            />
          </FormItem>
        </ButtonGroup>

        <Group header={<Header mode="secondary">Список групп</Header>}>
          {displayedGroups.map((group) => {
            return (
              <Group key={group.id}>
                <SimpleCell
                  before={
                    <Avatar
                      size={48}
                      style={{ backgroundColor: `${group.avatar_color}` }}
                    />
                  }
                  subtitle={generateSubtitle(group)}
                  after={group.closed && <p>Закрытая группа</p>}
                >
                  {group.name}
                </SimpleCell>

                {group.friends && showedFriends === group.id && (
                  <Group
                    header={<Header mode="secondary">Друзья в группе:</Header>}
                  >
                    {group.friends.map((friend) => {
                      return (
                        <SimpleCell key={friend.first_name + friend.last_name}>
                          {friend.first_name + " " + friend.last_name}
                        </SimpleCell>
                      );
                    })}
                  </Group>
                )}
              </Group>
            );
          })}
        </Group>
      </Panel>
    </View>
  );
}

export default App;
