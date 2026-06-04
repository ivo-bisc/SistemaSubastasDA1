import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/auth';
import {
  ConsignmentFormField,
  ConsignmentScreenShell,
  FormSelect,
  FormTextArea,
  MIN_CONSIGNMENT_PHOTOS,
  PhotoUploadGrid,
  createEmptyPhotoSlots,
} from '../../components/consignment';
import { Colors, Fonts, FontSize } from '../../constants';
import { consignService } from '../../services';
import type { HomeStackParamList, MyAuctionsStackParamList } from '../../types';

type UploadRoute = RouteProp<
  HomeStackParamList | MyAuctionsStackParamList,
  'UploadItem'
>;
type Nav = StackNavigationProp<
  HomeStackParamList | MyAuctionsStackParamList,
  'UploadItem'
>;

const CATEGORY_OPTIONS = [
  { value: 'collectibles', label: 'Coleccionables' },
  { value: 'electronics', label: 'Electrónica' },
  { value: 'fashion', label: 'Moda' },
  { value: 'home', label: 'Hogar' },
  { value: 'other', label: 'Otros' },
];

const CONDITION_OPTIONS = [
  { value: 'new', label: 'Nuevo' },
  { value: 'like_new', label: 'Como nuevo' },
  { value: 'used', label: 'Usado' },
  { value: 'for_parts', label: 'Para repuestos' },
];

const CURRENCY_OPTIONS = [
  { value: 'ars', label: 'Pesos argentinos' },
  { value: 'usd', label: 'Dólares' },
];

const COMMISSION_PERCENT = 8;

export default function UploadItemScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<UploadRoute>();
  const returnTo = route.params?.returnTo ?? 'home';

  const [name, setName] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [photos, setPhotos] = useState(createEmptyPhotoSlots);
  const [aceptaPertenencia, setAceptaPertenencia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleConfirm = useCallback(async () => {
    const photoCount = photos.filter(Boolean).length;

    setSubmitAttempted(true);

    if (
      !name.trim() ||
      !category ||
      !description.trim() ||
      !condition ||
      !currency ||
      !suggestedPrice.trim() ||
      photoCount < MIN_CONSIGNMENT_PHOTOS ||
      !aceptaPertenencia
    ) {
      return;
    }

    setLoading(true);
    try {
      await consignService.submitItem({
        name: name.trim(),
        category,
        description: description.trim(),
        condition,
        currency,
        suggestedPrice,
        aceptaPertenencia,
      });
      navigation.navigate('ItemUploaded', { returnTo });
    } catch (err: any) {
      if (err?.message === 'SIN_MEDIO_PAGO') {
        Alert.alert('Sin medio de pago', 'Necesitás agregar un medio de pago antes de consignar.');
      } else {
        Alert.alert('Error', 'No se pudo enviar la consignación. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [
    navigation,
    name,
    category,
    description,
    condition,
    currency,
    suggestedPrice,
    photos,
    aceptaPertenencia,
    returnTo,
  ]);

  const handleSuggestedPriceChange = useCallback((text: string) => {
    setSuggestedPrice(text.replace(/\D/g, ''));
  }, []);

  const hasMissingName = !name.trim();
  const hasMissingCategory = !category;
  const hasMissingDescription = !description.trim();
  const hasMissingCondition = !condition;
  const hasMissingCurrency = !currency;
  const hasMissingPrice = !suggestedPrice.trim();
  const hasMissingPhotos = photos.filter(Boolean).length < MIN_CONSIGNMENT_PHOTOS;
  const hasMissingPertenencia = !aceptaPertenencia;
  const showErrors = submitAttempted;

  const footer = useMemo(
    () => <PrimaryButton label="Confirmar" onPress={handleConfirm} loading={loading} />,
    [handleConfirm, loading]
  );

  return (
    <ConsignmentScreenShell footer={footer}>
      <Pressable
        style={({ pressed }) => [styles.backBtn, pressed && styles.backPressed]}
        onPress={() => navigation.goBack()}
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
      </Pressable>

      <Text style={styles.title}>Subastá tu artículo</Text>

      <View style={styles.formCard}>
        <ConsignmentFormField
          placeholder="Nombre del artículo"
          value={name}
          onChangeText={setName}
        />
        {showErrors && hasMissingName ? (
          <Text style={styles.fieldError}>El nombre del artículo es obligatorio.</Text>
        ) : null}
        <FormSelect
          placeholder="Categoría"
          options={CATEGORY_OPTIONS}
          value={category}
          onValueChange={setCategory}
        />
        {showErrors && hasMissingCategory ? (
          <Text style={styles.fieldError}>Seleccioná una categoría.</Text>
        ) : null}
        <FormTextArea
          placeholder="Descripción"
          value={description}
          onChangeText={setDescription}
        />
        {showErrors && hasMissingDescription ? (
          <Text style={styles.fieldError}>La descripción es obligatoria.</Text>
        ) : null}
        <FormSelect
          placeholder="Estado"
          options={CONDITION_OPTIONS}
          value={condition}
          onValueChange={setCondition}
        />
        {showErrors && hasMissingCondition ? (
          <Text style={styles.fieldError}>Seleccioná el estado del artículo.</Text>
        ) : null}
        <FormSelect
          placeholder="Moneda"
          options={CURRENCY_OPTIONS}
          value={currency}
          onValueChange={setCurrency}
        />
        {showErrors && hasMissingCurrency ? (
          <Text style={styles.fieldError}>Seleccioná una moneda.</Text>
        ) : null}
        <ConsignmentFormField
          placeholder="Precio base sugerido"
          value={suggestedPrice}
          onChangeText={handleSuggestedPriceChange}
          keyboardType="numeric"
        />
        {showErrors && hasMissingPrice ? (
          <Text style={styles.fieldError}>Ingresá un precio base sugerido.</Text>
        ) : null}
        <Text style={styles.commission}>
          Se cobrará una comisión del {COMMISSION_PERCENT}% del valor final.
        </Text>
        <Pressable
          style={styles.checkboxRow}
          onPress={() => setAceptaPertenencia((v) => !v)}
        >
          <View style={[styles.checkbox, aceptaPertenencia && styles.checkboxChecked]}>
            {aceptaPertenencia ? (
              <Ionicons name="checkmark" size={14} color={Colors.white} />
            ) : null}
          </View>
          <Text style={styles.checkboxLabel}>
            Declaro que este artículo es de mi propiedad.
          </Text>
        </Pressable>
        {showErrors && hasMissingPertenencia ? (
          <Text style={styles.fieldError}>Debés declarar que el artículo te pertenece.</Text>
        ) : null}
      </View>

      <View style={styles.photosCard}>
        <PhotoUploadGrid photos={photos} onChange={setPhotos} />
        {showErrors && hasMissingPhotos ? (
          <Text style={styles.fieldError}>
            Debés adjuntar al menos {MIN_CONSIGNMENT_PHOTOS} fotos.
          </Text>
        ) : null}
      </View>
    </ConsignmentScreenShell>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backPressed: {
    opacity: 0.88,
  },
  title: {
    fontFamily: Fonts.title,
    fontSize: FontSize.xxl,
    color: Colors.black,
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    paddingBottom: 4,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  commission: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.cardTime,
    marginTop: -4,
    marginBottom: 8,
    lineHeight: 16,
  },
  fieldError: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: '#FF3B30',
    marginTop: -6,
    marginBottom: 10,
    lineHeight: 16,
  },
  photosCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkboxLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    flex: 1,
  },
});
