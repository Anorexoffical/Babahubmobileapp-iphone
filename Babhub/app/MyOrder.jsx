// app/screens/MyOrder.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ScrollView,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Linking,
  BackHandler,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from './contexts/AuthContext';
import http from '../src/api/http';

const { width, height } = Dimensions.get('window');

// Enhanced Brand Color Palette
const COLORS = {
  primary: '#6366F1',
  primaryLight: '#8B5CF6',
  primaryDark: '#4F46E5',
  secondary: '#EC4899',
  secondaryLight: '#F472B6',
  accent: '#10B981',
  accentLight: '#34D399',
  dark: '#1F2937',
  darkLight: '#374151',
  gray: '#6B7280',
  grayLight: '#9CA3AF',
  light: '#F3F4F6',
  background: '#F9FAFB',
  white: '#FFFFFF',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  whatsapp: '#25D366',
};

// Enhanced responsive scaling functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Calculate dynamic spacer height based on screen size and platform
const getNavigationBarHeight = () => {
  if (Platform.OS === 'ios') {
    return height > 800 ? 34 : 20; // For notch devices and older iPhones
  } else {
    // Android/Huawei devices - responsive calculation
    if (height < 600) return 16; // Small devices
    if (height < 700) return 20; // Medium devices
    if (height < 800) return 24; // Large devices
    if (height < 900) return 28; // Extra large devices
    return 32; // Very large devices (tablets)
  }
};

// Get status bar height for Android
const getStatusBarHeight = () => {
  return Platform.OS === 'android' ? StatusBar.currentHeight : 0;
};

const MyOrder = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  const modalAnimation = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user?.email) {
          setLoading(false);
          return;
        }

        const { data } = await http.get(
          `/order/myorder?userEmail=${user.email}`
        );

        setOrders(data);
      } catch (error) {
        if (error.response && error.response.data) {
          console.error("Failed to fetch orders:", error.response.data);
        } else {
          console.error("Error fetching orders:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Handle back button and hardware back press - UPDATED
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true; // Prevent default back behavior
    });

    return () => backHandler.remove();
  }, []);

  // UPDATED: Navigate to Profile screen when back is pressed
  const handleBack = () => {
    // Always navigate to Profile screen, never go back in history
    router.replace('/(tabs)/ProfileScreen');
    return true;
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
    Animated.spring(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideOrderDetails = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedOrder(null);
    });
  };

  // Format order ID to be shorter
  const formatOrderId = (orderId) => {
    if (!orderId) return 'N/A';
    if (orderId.length <= 8) return `#${orderId}`;
    return `#${orderId.slice(0, 8)}...`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return 'checkmark-circle';
      case 'Shipped':
        return 'rocket';
      case 'Processing':
        return 'time';
      case 'Pending':
        return 'hourglass';
      case 'Cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'Completed':
        return 'Your order has been delivered successfully';
      case 'Shipped':
        return 'Your order is on the way to you';
      case 'Processing':
        return 'We are preparing your order for shipment';
      case 'Pending':
        return 'Your order is being confirmed';
      case 'Cancelled':
        return 'This order has been cancelled';
      default:
        return 'Order status information';
    }
  };

  const handleWhatsAppSupport = (orderId) => {
    const phoneNumber = '+27845000000';
    const message = `Hello, I need help with my order ${orderId}. Can you assist me?`;
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.openURL(url).catch(() => {
      alert('WhatsApp is not installed on your device');
    });
  };

  const renderOrder = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => showOrderDetails(item)}
    >
      {/* Order Header */}
      <View style={styles.cardHeader}>
        <View style={styles.orderInfo}>
          <View style={styles.orderIdContainer}>
            <Ionicons name="receipt-outline" size={scale(16)} color={COLORS.primary} />
            <Text style={styles.orderId} numberOfLines={1}>
              {formatOrderId(item.orderID)}
            </Text>
          </View>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        
        <View style={[styles.statusBadge, getStatusStyle(item.deliveryStatus)]}>
          <Ionicons 
            name={getStatusIcon(item.deliveryStatus)} 
            size={scale(14)} 
            color={getStatusTextStyle(item.deliveryStatus).color} 
          />
          <Text style={[styles.statusText, getStatusTextStyle(item.deliveryStatus)]}>
            {getStatusDisplay(item.deliveryStatus)}
          </Text>
        </View>
      </View>

      {/* Order Items Preview */}
      <View style={styles.itemsPreview}>
        <Text style={styles.itemsCount}>
          {item.items.length} item{item.items.length !== 1 ? 's' : ''}
        </Text>
        <View style={styles.itemsList}>
          {item.items.slice(0, 2).map((product, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.bulletPoint} />
              <Text style={styles.itemPreview} numberOfLines={1}>
                {product.title}
              </Text>
            </View>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreItems}>+{item.items.length - 2} more items</Text>
          )}
        </View>
      </View>

      {/* Order Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.orderTotal}>
            R {parseFloat(item.totalAmountAfterTax).toLocaleString()}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => showOrderDetails(item)}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
          <Ionicons name="chevron-forward" size={scale(16)} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'Completed': 'Delivered',
      'Shipped': 'Shipped',
      'Processing': 'Processing',
      'Pending': 'Pending',
      'Cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
        return { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' };
      case 'Shipped':
        return { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' };
      case 'Processing':
        return { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' };
      case 'Pending':
        return { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' };
      case 'Cancelled':
        return { backgroundColor: '#FEF2F2', borderColor: '#FECACA' };
      default:
        return { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' };
    }
  };

  const getStatusTextStyle = (status) => {
    switch (status) {
      case 'Completed':
        return { color: COLORS.success };
      case 'Shipped':
        return { color: COLORS.primary };
      case 'Processing':
        return { color: COLORS.warning };
      case 'Pending':
        return { color: COLORS.gray };
      case 'Cancelled':
        return { color: COLORS.error };
      default:
        return { color: COLORS.gray };
    }
  };

  const OrderDetailModal = () => {
    if (!selectedOrder) return null;

    const modalTranslateY = modalAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [height, 0],
    });

    // Calculate subtotal from items
    const calculateSubtotal = () => {
      return selectedOrder.items.reduce((total, item) => {
        return total + (parseFloat(item.price) * parseInt(item.quantity));
      }, 0);
    };

    const subtotal = calculateSubtotal();
    const totalAmount = parseFloat(selectedOrder.totalAmountAfterTax);

    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={hideOrderDetails}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={hideOrderDetails}>
              <View style={styles.modalOverlayTouchable} />
            </TouchableWithoutFeedback>
            
            <Animated.View 
              style={[
                styles.modalContent,
                { transform: [{ translateY: modalTranslateY }] }
              ]}
            >
              {/* Modal Header - Consistent with main header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <Text style={styles.modalTitle}>Order Details</Text>
                  <Text style={styles.modalSubtitle}>
                    {formatOrderId(selectedOrder.orderID)} • {formatDate(selectedOrder.createdAt)}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={hideOrderDetails}
                >
                  <Ionicons name="close" size={scale(24)} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                {/* Enhanced Order Status Card */}
                <View style={styles.statusCard}>
                  <View style={styles.statusHeader}>
                    <View style={styles.statusIconMain}>
                      <Ionicons 
                        name={getStatusIcon(selectedOrder.deliveryStatus)} 
                        size={scale(28)} 
                        color={getStatusTextStyle(selectedOrder.deliveryStatus).color} 
                      />
                    </View>
                    <View style={styles.statusContent}>
                      <Text style={styles.statusTitle}>Order Status</Text>
                      <View style={[styles.statusBadgeLarge, getStatusStyle(selectedOrder.deliveryStatus)]}>
                        <Ionicons 
                          name={getStatusIcon(selectedOrder.deliveryStatus)} 
                          size={scale(16)} 
                          color={getStatusTextStyle(selectedOrder.deliveryStatus).color} 
                        />
                        <Text style={[styles.statusTextLarge, getStatusTextStyle(selectedOrder.deliveryStatus)]}>
                          {getStatusDisplay(selectedOrder.deliveryStatus)}
                        </Text>
                      </View>
                      <Text style={styles.statusDescription}>
                        {getStatusDescription(selectedOrder.deliveryStatus)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Order Items */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Order Items</Text>
                  <View style={styles.itemsContainer}>
                    {selectedOrder.items.map((item, index) => (
                      <View key={index} style={styles.orderItemCard}>
                        <View style={styles.itemContent}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          
                          {/* Item Variants */}
                          <View style={styles.itemVariants}>
                            {item.color && (
                              <View style={styles.variantChip}>
                                <Text style={styles.variantText}>Color: {item.color}</Text>
                              </View>
                            )}
                            {item.size && (
                              <View style={styles.variantChip}>
                                <Text style={styles.variantText}>Size: {item.size}</Text>
                              </View>
                            )}
                          </View>

                          {/* Quantity and Price */}
                          <View style={styles.itemDetails}>
                            <View style={styles.quantityContainer}>
                              <Text style={styles.quantityLabel}>Quantity:</Text>
                              <Text style={styles.quantityValue}>{item.quantity}</Text>
                            </View>
                            <View style={styles.priceContainer}>
                              <Text style={styles.itemPrice}>R {parseFloat(item.price).toLocaleString()} each</Text>
                              <Text style={styles.itemTotal}>
                                R {(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString()}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Order Summary */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Payment Summary</Text>
                  <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Items Total</Text>
                      <Text style={styles.summaryValue}>
                        R {subtotal.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Shipping Fee</Text>
                      <Text style={styles.freeText}>FREE</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Tax & Charges</Text>
                      <Text style={styles.summaryValue}>
                        R 00
                      </Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.finalTotal}>
                      <Text style={styles.finalTotalLabel}>Total Paid</Text>
                      <Text style={styles.finalTotalValue}>
                        R {totalAmount.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Enhanced Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.whatsappButton}
                  onPress={() => handleWhatsAppSupport(selectedOrder.orderID)}
                >
                  <Ionicons name="logo-whatsapp" size={scale(20)} color={COLORS.white} />
                  <Text style={styles.whatsappButtonText}>Get Help on WhatsApp</Text>
                </TouchableOpacity>
              </View>

              {/* Navigation Bar Spacer for Android/Huawei */}
              <View style={styles.modalNavigationSpacer} />
            </Animated.View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={scale(24)} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Orders</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading your orders...</Text>
          </View>
          
          {/* Enhanced Navigation Bar Spacer with white background */}
          <View style={styles.navigationBarSpacer} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        
        {/* Header - Consistent styling */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={scale(24)} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Ionicons name="receipt" size={scale(20)} color={COLORS.primary} />
              <Text style={styles.summaryNumber}>{orders.length}</Text>
              <Text style={styles.summaryLabel}>Total Orders</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle" size={scale(20)} color={COLORS.success} />
              <Text style={styles.summaryNumber}>
                {orders.filter(order => order.deliveryStatus === 'Completed').length}
              </Text>
              <Text style={styles.summaryLabel}>Delivered</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Ionicons name="time" size={scale(20)} color={COLORS.warning} />
              <Text style={styles.summaryNumber}>
                {orders.filter(order => order.deliveryStatus === 'Processing').length}
              </Text>
              <Text style={styles.summaryLabel}>Processing</Text>
            </View>
          </View>
        </View>

        {/* Orders List */}
        {orders.length > 0 ? (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id || item.orderID}
            renderItem={renderOrder}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.recentOrdersTitle}>Recent Orders</Text>
                <Text style={styles.ordersSubtitle}>
                  Tap on any order to view details
                </Text>
            </View>
            }
          />
        ) : (
          <ScrollView contentContainerStyle={styles.emptyContainer}>
            <View style={styles.emptyIllustration}>
              <Ionicons name="bag-handle-outline" size={scale(80)} color={COLORS.grayLight} />
            </View>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyText}>
              When you place orders, they will appear here with all the details
            </Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => router.replace('/(tabs)/HomeScreen')}
            >
              <Ionicons name="storefront-outline" size={scale(20)} color={COLORS.white} />
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Order Detail Modal */}
        <OrderDetailModal />

        {/* Enhanced Navigation Bar Spacer for Android/Huawei with white background */}
        <View style={styles.navigationBarSpacer} />
      </View>
    </SafeAreaView>
  );
};

export default MyOrder;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Platform.OS === 'android' ? COLORS.white : COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    paddingTop: Platform.OS === 'ios' ? verticalScale(12) : verticalScale(12) + getStatusBarHeight(),
    borderBottomLeftRadius: scale(20),
    borderBottomRightRadius: scale(20),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(20),
    elevation: 10,
  },
  backButton: {
    padding: scale(8),
    borderRadius: scale(12),
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: scale(40),
  },
  summaryContainer: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(8),
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: scale(16),
    padding: scale(16),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: scale(4) },
    shadowRadius: scale(16),
    elevation: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: verticalScale(4),
  },
  summaryLabel: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.light,
    marginHorizontal: scale(8),
  },
  listHeader: {
    marginBottom: verticalScale(12),
    paddingTop: verticalScale(4),
  },
  recentOrdersTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: verticalScale(2),
  },
  ordersSubtitle: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(20),
    paddingTop: 0,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: scale(16),
    borderRadius: scale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: scale(4) },
    shadowRadius: scale(12),
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  orderInfo: {
    flex: 1,
    marginRight: scale(12),
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  orderId: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.dark,
    marginLeft: scale(6),
    flex: 1,
  },
  orderDate: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
    borderRadius: scale(16),
    borderWidth: 1,
    gap: scale(4),
  },
  statusText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  itemsPreview: {
    marginBottom: verticalScale(12),
  },
  itemsCount: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    fontWeight: '600',
    marginBottom: verticalScale(6),
  },
  itemsList: {
    gap: verticalScale(4),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletPoint: {
    width: scale(4),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: COLORS.primary,
    marginRight: scale(8),
  },
  itemPreview: {
    fontSize: moderateScale(14),
    color: COLORS.dark,
    fontWeight: '500',
    flex: 1,
  },
  moreItems: {
    fontSize: moderateScale(13),
    color: COLORS.primary,
    fontWeight: '600',
    fontStyle: 'italic',
    marginLeft: scale(12),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: verticalScale(2),
  },
  orderTotal: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.primary,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: scale(12),
    backgroundColor: COLORS.primary + '08',
  },
  detailsButtonText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: scale(4),
  },
  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlayTouchable: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: scale(20),
    paddingBottom: scale(16),
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: verticalScale(4),
  },
  modalSubtitle: {
    fontSize: moderateScale(13),
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  closeButton: {
    padding: scale(4),
    marginLeft: scale(12),
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(16),
  },
  // Enhanced Status Card
  statusCard: {
    backgroundColor: COLORS.background,
    padding: scale(16),
    borderRadius: scale(16),
    marginVertical: verticalScale(12),
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(16),
  },
  statusIconMain: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: scale(2) },
    shadowRadius: scale(8),
    elevation: 2,
  },
  statusContent: {
    flex: 1,
    gap: verticalScale(8),
  },
  statusTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.gray,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(16),
    borderWidth: 1,
    gap: scale(6),
    alignSelf: 'flex-start',
  },
  statusTextLarge: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statusDescription: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    lineHeight: scale(18),
  },
  modalSection: {
    marginBottom: verticalScale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: verticalScale(12),
  },
  itemsContainer: {
    gap: verticalScale(10),
  },
  orderItemCard: {
    backgroundColor: COLORS.white,
    padding: scale(14),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: COLORS.light,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: scale(2) },
    shadowRadius: scale(8),
    elevation: 2,
  },
  itemContent: {
    gap: verticalScale(10),
  },
  itemTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.dark,
    lineHeight: scale(20),
  },
  itemVariants: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(6),
  },
  variantChip: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  variantText: {
    fontSize: moderateScale(12),
    color: COLORS.primary,
    fontWeight: '500',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  quantityLabel: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    fontWeight: '500',
  },
  quantityValue: {
    fontSize: moderateScale(13),
    color: COLORS.dark,
    fontWeight: '600',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: scale(6),
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: verticalScale(2),
  },
  itemTotal: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryCard: {
    backgroundColor: COLORS.background,
    padding: scale(16),
    borderRadius: scale(12),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  summaryLabel: {
    fontSize: moderateScale(14),
    color: COLORS.gray,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: moderateScale(14),
    color: COLORS.dark,
    fontWeight: '600',
  },
  freeText: {
    fontSize: moderateScale(14),
    color: COLORS.success,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.light,
    marginVertical: verticalScale(8),
  },
  finalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(6),
    paddingTop: verticalScale(10),
    borderTopWidth: 2,
    borderTopColor: COLORS.primary + '30',
  },
  finalTotalLabel: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.dark,
  },
  finalTotalValue: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.primary,
  },
  // Enhanced Modal Actions
  modalActions: {
    padding: scale(20),
    paddingTop: scale(16),
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    backgroundColor: COLORS.white,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.whatsapp,
    paddingVertical: verticalScale(16),
    borderRadius: scale(12),
    gap: scale(8),
    shadowColor: COLORS.whatsapp,
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 4,
  },
  whatsappButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  // Enhanced Navigation Bar Spacer with white background
  navigationBarSpacer: {
    height: getNavigationBarHeight(),
    backgroundColor: COLORS.white,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  modalNavigationSpacer: {
    height: getNavigationBarHeight(),
    backgroundColor: COLORS.white,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: verticalScale(20),
    fontSize: moderateScale(15),
    color: COLORS.gray,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(40),
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(80), // Extra padding for bottom navigation
  },
  emptyIllustration: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  emptyTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  emptyText: {
    fontSize: moderateScale(15),
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: verticalScale(28),
    lineHeight: scale(22),
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(14),
    borderRadius: scale(14),
    gap: scale(8),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 4,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
});