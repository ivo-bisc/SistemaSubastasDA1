import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize } from '../../constants';

export interface DropdownOption {
  value: string;
  label: string;
}

interface Props {
  options: DropdownOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export default function DropdownFilter({
  options,
  selectedValue,
  onValueChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === selectedValue) || options[0];

  const handleSelect = (val: string) => {
    onValueChange(val);
    setIsOpen(false);
  };

  return (
    <View>
      {/* Dropdown Button */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.buttonText}>{selectedOption.label}</Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={Colors.black}
          style={styles.chevron}
        />
      </Pressable>

      {/* Popover / Overlay Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                {options.map((option, index) => {
                  const isSelected = option.value === selectedValue;
                  return (
                    <View key={option.value}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.menuItem,
                          pressed && styles.menuItemPressed,
                        ]}
                        onPress={() => handleSelect(option.value)}
                      >
                        <View style={styles.checkIconWrap}>
                          {isSelected ? (
                            <Ionicons name="checkmark" size={16} color={Colors.black} />
                          ) : null}
                        </View>
                        <Text
                          style={[
                            styles.menuItemText,
                            isSelected && styles.menuItemTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                      {index < options.length - 1 ? (
                        <View style={styles.separator} />
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFEFEF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 160,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.black,
    marginRight: 8,
  },
  chevron: {
    marginLeft: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '80%',
    maxWidth: 300,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemPressed: {
    backgroundColor: '#F5F5F5',
  },
  checkIconWrap: {
    width: 24,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  menuItemText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.md,
    color: Colors.black,
  },
  menuItemTextActive: {
    fontFamily: Fonts.bodyBold,
  },
  separator: {
    height: 1,
    backgroundColor: '#EAEAEA',
  },
});
