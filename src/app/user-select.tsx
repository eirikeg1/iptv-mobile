import { AddUserCard, UserProfileCard } from '@/components/domain/user/user-profile-card';
import { useUserStore } from '@/states/user-store';
import type { User } from '@/types/user.types';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

// Constants
const PLACEHOLDER_COLOR = '#9CA3AF';
const PROFILE_ICON = '👤';

// Types
interface UserFormProps {
  username: string;
  isCreating: boolean;
  onUsernameChange: (text: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

interface UserGridItemProps {
  user: User;
  isCurrentUser: boolean;
  onSelect: (userId: string) => void;
}

interface UserSelectionScreenProps {
  users: User[];
  currentUserId?: string;
  onSelectUser: (userId: string) => void;
  onAddUser: () => void;
  onBack: () => void;
}

/**
 * First-time user creation screen
 */
function FirstUserScreen({ username, isCreating, onUsernameChange, onSubmit }: UserFormProps) {
  return (
    <View className="flex-1 bg-white dark:bg-gray-950 justify-center">
      <View className="px-8">
        <View className="mb-12">
          <Text className="text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Welcome!
          </Text>
          <Text className="text-lg text-center text-gray-600 dark:text-gray-400">
            Let's create your profile to get started
          </Text>
        </View>

        <View className="items-center mb-8">
          <View className="w-32 h-32 rounded-full bg-blue-600 items-center justify-center">
            <Text className="text-6xl">{PROFILE_ICON}</Text>
          </View>
        </View>

        <View className="max-w-md w-full mx-auto">
          <Text className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Your Name
          </Text>

          <TextInput
            className="bg-gray-100 dark:bg-gray-800 px-5 py-4 rounded-xl text-lg text-gray-900 dark:text-white mb-6 border border-gray-200 dark:border-gray-700"
            placeholder="Enter your name"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={username}
            onChangeText={onUsernameChange}
            autoFocus
            editable={!isCreating}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />

          <Pressable
            onPress={onSubmit}
            disabled={isCreating || !username.trim()}
            className="bg-blue-600 py-4 rounded-xl disabled:opacity-50"
            accessibilityRole="button"
            accessibilityLabel="Create profile and continue"
          >
            <Text className="text-center text-lg font-semibold text-white">
              {isCreating ? 'Creating Profile...' : 'Continue'}
            </Text>
          </Pressable>
        </View>

        <View className="mt-12">
          <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
            You can add more profiles later in settings
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * User profile grid item with current user badge
 */
function UserGridItem({ user, isCurrentUser, onSelect }: UserGridItemProps) {
  return (
    <View className="w-32">
      <UserProfileCard user={user} onPress={() => onSelect(user.id)} />
      {isCurrentUser && (
        <View className="mt-2 items-center">
          <View className="px-3 py-1 bg-blue-600 rounded-full">
            <Text className="text-xs font-semibold text-white">Current</Text>
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * Netflix-style user selection grid
 */
function UserSelectionScreen({
  users,
  currentUserId,
  onSelectUser,
  onAddUser,
  onBack,
}: UserSelectionScreenProps) {
  return (
    <ScrollView contentContainerClassName="flex-grow justify-center py-8">
      <View className="px-8">
        <View className="mb-16">
          <Text className="text-5xl font-bold text-center text-gray-900 dark:text-white">
            Who's watching?
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-center gap-8 mb-8">
          {users.map((user) => (
            <UserGridItem
              key={user.id}
              user={user}
              isCurrentUser={user.id === currentUserId}
              onSelect={onSelectUser}
            />
          ))}

          <View className="w-32">
            <AddUserCard onPress={onAddUser} />
          </View>
        </View>

        <View className="items-center mt-8">
          <Pressable
            onPress={onBack}
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg"
            accessibilityRole="button"
            accessibilityLabel="Back to settings"
          >
            <Text className="text-base font-medium text-gray-700 dark:text-gray-300">
              Back to Settings
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Modal for creating a new user profile
 */
function CreateUserModal({ username, isCreating, onUsernameChange, onSubmit, onCancel }: UserFormProps) {
  return (
    <View className="absolute inset-0 bg-black/80 justify-center items-center px-8">
      <View className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-md">
        <Text className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
          Create New Profile
        </Text>

        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-blue-600 items-center justify-center">
            <Text className="text-5xl">{PROFILE_ICON}</Text>
          </View>
        </View>

        <Text className="text-base font-semibold mb-3 text-gray-900 dark:text-white">Name</Text>

        <TextInput
          className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-xl text-base text-gray-900 dark:text-white mb-6 border border-gray-200 dark:border-gray-700"
          placeholder="Enter name"
          placeholderTextColor={PLACEHOLDER_COLOR}
          value={username}
          onChangeText={onUsernameChange}
          autoFocus
          editable={!isCreating}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />

        <View className="flex-row gap-3">
          <Pressable
            onPress={onCancel}
            disabled={isCreating}
            className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded-xl disabled:opacity-50"
            accessibilityRole="button"
            accessibilityLabel="Cancel profile creation"
          >
            <Text className="text-center text-base font-semibold text-gray-900 dark:text-white">
              Cancel
            </Text>
          </Pressable>

          <Pressable
            onPress={onSubmit}
            disabled={isCreating || !username.trim()}
            className="flex-1 bg-blue-600 py-3 rounded-xl disabled:opacity-50"
            accessibilityRole="button"
            accessibilityLabel="Create new profile"
          >
            <Text className="text-center text-base font-semibold text-white">
              {isCreating ? 'Creating...' : 'Create'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/**
 * Main user selection screen component
 */
export default function UserSelectScreen() {
  // Store state
  const users = useUserStore((state) => state.users);
  const currentUser = useUserStore((state) => state.currentUser);
  const switchUser = useUserStore((state) => state.switchUser);
  const createUser = useUserStore((state) => state.createUser);

  // Local state
  const [newUsername, setNewUsername] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isFirstUser = users.length === 0;

  // Event handlers
  const handleSelectUser = useCallback(
    async (userId: string) => {
      if (userId === currentUser?.id) {
        router.back();
        return;
      }

      try {
        await switchUser(userId);
        router.back();
      } catch (error) {
        console.error('[UserSelect] Failed to switch user:', error);
        Alert.alert('Error', 'Failed to switch user. Please try again.');
      }
    },
    [currentUser?.id, switchUser]
  );

  const handleCreateUser = useCallback(async () => {
    const trimmedUsername = newUsername.trim();

    if (!trimmedUsername) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    setIsCreating(true);

    try {
      const newUser = await createUser({ username: trimmedUsername });

      // Reset form state
      setNewUsername('');
      setShowCreateForm(false);

      // For first user, switch to them and navigate to tabs
      if (isFirstUser) {
        await switchUser(newUser.id);
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('[UserSelect] Failed to create user:', error);
      Alert.alert('Error', 'Failed to create user. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [newUsername, isFirstUser, createUser, switchUser]);

  const handleAddUserPress = useCallback(() => {
    setShowCreateForm(true);
    setNewUsername('');
  }, []);

  const handleCancelCreate = useCallback(() => {
    setShowCreateForm(false);
    setNewUsername('');
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  // Render first-time user creation screen
  if (isFirstUser) {
    return (
      <FirstUserScreen
        username={newUsername}
        isCreating={isCreating}
        onUsernameChange={setNewUsername}
        onSubmit={handleCreateUser}
      />
    );
  }

  // Render user selection screen with optional create modal
  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <UserSelectionScreen
        users={users}
        currentUserId={currentUser?.id}
        onSelectUser={handleSelectUser}
        onAddUser={handleAddUserPress}
        onBack={handleBack}
      />

      {showCreateForm && (
        <CreateUserModal
          username={newUsername}
          isCreating={isCreating}
          onUsernameChange={setNewUsername}
          onSubmit={handleCreateUser}
          onCancel={handleCancelCreate}
        />
      )}
    </View>
  );
}
