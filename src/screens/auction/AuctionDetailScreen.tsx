import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AuctionBottomBar,
  AuctionImageHeader,
  AuctionProductInfo,
  AuctionStatsCards,
  BidHistoryRow,
  ConfirmBidModal,
} from '../../components/auction';
import { Colors, Fonts, FontSize } from '../../constants';
import { MOCK_AUCTION_DETAIL } from '../../data/mockAuctionDetail';

const IMAGE_HEIGHT = 200;
/** Altura aproximada del panel violeta colapsado — el blanco arranca debajo */
const COLLAPSED_VIOLET_HEIGHT = 118;

export default function AuctionDetailScreen() {
  const navigation = useNavigation();
  const auction = MOCK_AUCTION_DETAIL;

  const [violetExpanded, setVioletExpanded] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(
    auction.quickBidAmounts[0]
  );
  const [customBidMode, setCustomBidMode] = useState(false);
  const [customBidValue, setCustomBidValue] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(selectedAmount);

  const effectiveCustomAmount = useMemo(() => {
    const parsed = parseInt(customBidValue.replace(/\D/g, ''), 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [customBidValue]);

  const handlePlaceBid = () => {
    setPendingAmount(selectedAmount);
    setConfirmVisible(true);
  };

  const handleConfirmCustomBid = () => {
    if (effectiveCustomAmount > auction.lastBid) {
      setSelectedAmount(effectiveCustomAmount);
      setCustomBidMode(false);
      setCustomBidValue('');
    }
  };

  const handleConfirmBid = () => {
    setConfirmVisible(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <AuctionImageHeader
          imageUrl={auction.imageUrl}
          height={IMAGE_HEIGHT}
          onBack={() => navigation.goBack()}
        />

        <View style={styles.body}>
          {/* Blanco: siempre llena el body, scrolleable por detrás */}
          <View style={styles.whitePanel}>
            <ScrollView
              style={styles.whiteScroll}
              contentContainerStyle={[
                styles.whiteScrollContent,
                { paddingTop: COLLAPSED_VIOLET_HEIGHT + 12 },
              ]}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              <AuctionStatsCards
                initialPrice={auction.initialPrice}
                lastBid={auction.lastBid}
                currency={auction.currency}
                timeRemaining={auction.timeRemaining}
              />

              <View style={styles.liveHeader}>
                <View style={styles.liveTitleRow}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveTitle}>Subasta en vivo</Text>
                </View>
                <Text style={styles.offerCount}>
                  {auction.offerCount} Ofertas
                </Text>
              </View>

              {auction.bids.map((bid) => (
                <BidHistoryRow key={bid.id} bid={bid} variant="light" />
              ))}
            </ScrollView>
          </View>

          {/* Violeta colapsado: tap → expande */}
          {!violetExpanded ? (
            <Pressable
              style={styles.violetCollapsed}
              onPress={() => setVioletExpanded(true)}
            >
              <AuctionProductInfo
                title={auction.title}
                sellerName={auction.sellerName}
                sellerAvatarColor={auction.sellerAvatarColor}
                status={auction.status}
                categories={auction.categories}
              />
            </Pressable>
          ) : null}

          {/* Violeta expandido: tap en header → colapsa; descripción scrollea */}
          {violetExpanded ? (
            <View style={styles.violetExpanded}>
              <ScrollView
                style={styles.violetScroll}
                contentContainerStyle={styles.violetScrollContent}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                <Pressable onPress={() => setVioletExpanded(false)}>
                  <AuctionProductInfo
                    title={auction.title}
                    sellerName={auction.sellerName}
                    sellerAvatarColor={auction.sellerAvatarColor}
                    status={auction.status}
                    categories={auction.categories}
                    titleSize={FontSize.category}
                  />
                </Pressable>

                <Text style={styles.descriptionHeading}>Descripción</Text>
                <Text style={styles.descriptionBody}>{auction.description}</Text>
              </ScrollView>
            </View>
          ) : null}
        </View>

        {customBidMode ? (
          <View style={styles.dimOverlay} pointerEvents="none" />
        ) : null}

        <AuctionBottomBar
          quickBidAmounts={auction.quickBidAmounts}
          selectedAmount={selectedAmount}
          customBidMode={customBidMode}
          customBidValue={customBidValue}
          currency={auction.currency}
          onSelectQuickBid={setSelectedAmount}
          onToggleCustomBid={() => setCustomBidMode(true)}
          onCustomBidChange={setCustomBidValue}
          onConfirmCustomBid={handleConfirmCustomBid}
          onCancelCustomBid={() => {
            setCustomBidMode(false);
            setCustomBidValue('');
          }}
          onPlaceBid={handlePlaceBid}
        />
      </View>

      <ConfirmBidModal
        visible={confirmVisible}
        amount={pendingAmount}
        currency={auction.currency}
        onConfirm={handleConfirmBid}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.auctionViolet,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5EEF0',
  },
  body: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  whitePanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  whiteScroll: {
    flex: 1,
  },
  whiteScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  violetCollapsed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: Colors.auctionViolet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  violetExpanded: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: Colors.auctionViolet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  violetScroll: {
    flex: 1,
  },
  violetScrollContent: {
    paddingBottom: 32,
  },
  descriptionHeading: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.base,
    color: Colors.white,
    marginTop: 12,
    marginBottom: 8,
  },
  descriptionBody: {
    fontFamily: Fonts.sora,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  liveTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginRight: 8,
  },
  liveTitle: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.base,
    color: Colors.black,
  },
  offerCount: {
    fontFamily: Fonts.sora,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    bottom: 160,
    zIndex: 15,
  },
});
