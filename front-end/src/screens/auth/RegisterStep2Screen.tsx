import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import {
  AuthScreen,
  AuthTitle,
  BackButton,
  BidUpTextField,
  CheckboxRow,
  PrimaryButton,
  StepLabel,
} from '../../components/auth';
import { authService } from '../../services';
import { useAuthStore } from '../../stores';
import type { AuthStackParamList } from '../../types';

type Nav = StackNavigationProp<AuthStackParamList, 'RegisterStep2'>;

// Bypass de desarrollo: el backend acepta este valor para saltear la verificación de email
// (no hay servidor de emails configurado en el proyecto)
const EMAIL_VERIFY_BYPASS = 'dev-bypass';

export default function RegisterStep2Screen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const params = route.params as { nombre: string; apellido: string; email: string; password: string };
  const login = useAuthStore((s) => s.login);

  const [tipoDoc, setTipoDoc] = useState('');
  const [numeroDoc, setNumeroDoc] = useState('');
  const [pais, setPais] = useState('');
  const [direccion, setDireccion] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [touched, setTouched] = useState({
    tipoDoc: false,
    numeroDoc: false,
    pais: false,
    direccion: false,
    codigoPostal: false,
  });
  const [fotoDniFrente, setFotoDniFrente] = useState<string | null>(null);
  const [fotoDniDorso, setFotoDniDorso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [showTipoModal, setShowTipoModal] = useState(false);
  const [showPaisModal, setShowPaisModal] = useState(false);

  const pickImage = async (setter: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  return (
    <View style={{ flex: 1 }}>
    <AuthScreen>
      <BackButton onPress={() => navigation.goBack()} />
      <AuthTitle>Creá tu cuenta</AuthTitle>
      <StepLabel step={2} total={3} />

      <Pressable onPress={() => setShowTipoModal(true)}>
        <BidUpTextField
          placeholder="Tipo de documento"
          value={tipoDoc}
          editable={false}
        />
      </Pressable>
      {touched.tipoDoc && !tipoDoc ? (
        <Text style={{ color: '#FF3B30', marginBottom: 8 }}>Seleccione tipo de documento.</Text>
      ) : null}
      <BidUpTextField
        placeholder="Número de documento"
        value={numeroDoc}
        onChangeText={(v) => setNumeroDoc(v.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        onBlur={() => setTouched((s) => ({ ...s, numeroDoc: true }))}
      />
      {touched.numeroDoc && numeroDoc.length !== 8 ? (
        <Text style={{ color: '#FF3B30', marginBottom: 8 }}>El número debe tener 8 dígitos.</Text>
      ) : null}

      <Pressable style={styles.photoBtn} onPress={() => pickImage(setFotoDniFrente)}>
        <Text style={styles.photoBtnText}>
          {fotoDniFrente ? '✓ Foto frente del DNI' : 'Foto frente del DNI'}
        </Text>
      </Pressable>
      <Pressable style={styles.photoBtn} onPress={() => pickImage(setFotoDniDorso)}>
        <Text style={styles.photoBtnText}>
          {fotoDniDorso ? '✓ Foto dorso del DNI' : 'Foto dorso del DNI'}
        </Text>
      </Pressable>
      <Pressable onPress={() => setShowPaisModal(true)}>
        <BidUpTextField placeholder="País" value={pais} editable={false} />
      </Pressable>
      {touched.pais && !pais ? (
        <Text style={{ color: '#FF3B30', marginBottom: 8 }}>Seleccione un país.</Text>
      ) : null}
      <BidUpTextField
        placeholder="Dirección"
        value={direccion}
        onChangeText={(v) => setDireccion(v)}
        onBlur={() => setTouched((s) => ({ ...s, direccion: true }))}
      />
      {touched.direccion && direccion.trim().length === 0 ? (
        <Text style={{ color: '#FF3B30', marginBottom: 8 }}>La dirección es obligatoria.</Text>
      ) : null}
      <BidUpTextField
        placeholder="Código postal"
        value={codigoPostal}
        onChangeText={(v) => setCodigoPostal(v.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        onBlur={() => setTouched((s) => ({ ...s, codigoPostal: true }))}
      />
      {touched.codigoPostal && codigoPostal.length !== 4 ? (
        <Text style={{ color: '#FF3B30', marginBottom: 8 }}>El código postal debe tener 4 dígitos.</Text>
      ) : null}

      <CheckboxRow
        label="Acepto los términos y condiciones"
        checked={termsAccepted}
        onToggle={() => setTermsAccepted((v) => !v)}
      />

      {apiError ? (
        <Text style={{ color: '#FF3B30', marginBottom: 8 }}>{apiError}</Text>
      ) : null}

      <PrimaryButton
        label="Continuar"
        onPress={async () => {
          setTouched({ tipoDoc: true, numeroDoc: true, pais: true, direccion: true, codigoPostal: true });
          const allValid =
            (tipoDoc === 'DNI' || tipoDoc === 'Pasaporte') &&
            numeroDoc.length === 8 &&
            pais.length > 0 &&
            direccion.trim().length > 0 &&
            codigoPostal.length === 4 &&
            termsAccepted &&
            !!fotoDniFrente &&
            !!fotoDniDorso;
          if (!allValid) return;

          setLoading(true);
          setApiError(null);
          try {
            const form = new FormData();
            form.append('nombre', params.nombre);
            form.append('apellido', params.apellido);
            form.append('email', params.email);
            form.append('numeroDni', numeroDoc);
            form.append('domicilioLegal', direccion);
            form.append('paisOrigen', pais);
            form.append('foto_dni_frente', { uri: fotoDniFrente, name: 'frente.jpg', type: 'image/jpeg' } as any);
            form.append('foto_dni_dorso', { uri: fotoDniDorso, name: 'dorso.jpg', type: 'image/jpeg' } as any);

            await authService.registerStep1(form);

            const paso2Res = await authService.registerStep2({
              tokenEmail: EMAIL_VERIFY_BYPASS,
              email: params.email,
              password: params.password,
            });

            const { tokenAcceso, usuarioId } = paso2Res.data;
            login(
              {
                id: String(usuarioId),
                email: params.email,
                firstName: params.nombre,
                lastName: params.apellido,
                dni: numeroDoc,
                status: 'pending',
              },
              tokenAcceso
            );

            navigation.navigate('RegisterStep3');
          } catch {
            setApiError('No se pudo completar el registro. Intentá de nuevo.');
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        style={styles.button}
      />

    </AuthScreen>

    {/* Tipo de documento modal — fuera del ScrollView para evitar problemas en Android */}
    <Modal visible={showTipoModal} transparent animationType="slide">
      <View style={modalStyles.backdrop}>
        <View style={modalStyles.sheet}>
          {['DNI', 'Pasaporte'].map((t) => (
            <Pressable
              key={t}
              style={modalStyles.option}
              onPress={() => {
                setTipoDoc(t);
                setShowTipoModal(false);
                setTouched((s) => ({ ...s, tipoDoc: true }));
              }}
            >
              <Text style={modalStyles.optionText}>{t}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => setShowTipoModal(false)} style={modalStyles.cancel}>
            <Text style={modalStyles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>

    {/* Países modal — fuera del ScrollView para evitar problemas en Android */}
    <Modal visible={showPaisModal} transparent animationType="slide">
      <View style={modalStyles.backdrop}>
        <View style={[modalStyles.sheet, { maxHeight: '70%' }]}>
          <FlatList
            data={COUNTRIES}
            keyExtractor={(i) => i}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={modalStyles.option}
                onPress={() => {
                  setPais(item);
                  setShowPaisModal(false);
                  setTouched((s) => ({ ...s, pais: true }));
                }}
              >
                <Text style={modalStyles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <Pressable onPress={() => setShowPaisModal(false)} style={modalStyles.cancel}>
            <Text style={modalStyles.cancelText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 4,
  },
  photoBtn: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  photoBtnText: {
    color: '#555555',
    fontSize: 14,
  },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
  cancel: {
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
  },
});

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi',
  'Côte d\'Ivoire','Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo (Congo-Brazzaville)','Costa Rica','Croatia','Cuba','Cyprus','Czechia',
  'Democratic Republic of the Congo','Denmark','Djibouti','Dominica','Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia',
  'Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana',
  'Haiti','Holy See','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg',
  'Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar',
  'Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Palau','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria',
  'Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States of America','Uruguay','Uzbekistan','Vanuatu','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe'
];
