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
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from './contexts/AuthContext';

const { width, height } = Dimensions.get('window');

// Premium Color Palette
const COLORS = {
  primary: '#5914ff',
  primaryLight: '#8c73ff',
  primaryDark: '#4800ff',
  secondary: '#693bff',
  secondaryLight: '#b1a6ff',
  secondaryDark: '#3d01d6',
  accent: '#3403af',
  accentLight: '#d2cdff',
  dark: '#1F2937',
  darkLight: '#374151',
  gray: '#6B7280',
  grayLight: '#9CA3AF',
  light: '#f8f7ff',
  background: '#f8f7ff',
  white: '#FFFFFF',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
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

        const response = await fetch(
          `https://account.babahub.co/api/order/myorder?userEmail=${user.email}`
        );

        const data = await response.json();

        if (response.ok) {
          setOrders(data);
        } else {
          console.error("Failed to fetch orders:", data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/ProfileScreen');
    }
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
    Animated.spring(modalAnimation, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const hideOrderDetails = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
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
        return 'Your order has been successfully delivered';
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
    const phoneNumber = '+923001234567';
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
            <View style={styles.orderIcon}>
              <Ionicons name="receipt-outline" size={16} color={COLORS.white} />
            </View>
            <View>
              <Text style={styles.orderId}>{formatOrderId(item.orderID)}</Text>
              <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.statusBadge, getStatusStyle(item.deliveryStatus)]}>
          <Text style={[styles.statusText, getStatusTextStyle(item.deliveryStatus)]}>
            {getStatusDisplay(item.deliveryStatus)}
          </Text>
        </View>
      </View>

      {/* Order Items Preview */}
      <View style={styles.itemsPreview}>
        <View style={styles.itemsHeader}>
          <Text style={styles.itemsCount}>
            {item.items.length} item{item.items.length !== 1 ? 's' : ''}
          </Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>
              PKR {parseFloat(item.totalAmountAfterTax).toLocaleString()}
            </Text>
          </View>
        </View>
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
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => showOrderDetails(item)}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
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

    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={hideOrderDetails}
      >
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
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <View style={styles.orderIconLarge}>
                  <Ionicons name="receipt" size={20} color={COLORS.white} />
                </View>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Order Details</Text>
                  <Text style={styles.modalSubtitle}>
                    {formatOrderId(selectedOrder.orderID)} • {formatDate(selectedOrder.createdAt)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={hideOrderDetails}
              >
                <Ionicons name="close" size={22} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Order Status Card */}
              <View style={styles.statusCard}>
                <View style={styles.statusContent}>
                  <View style={[styles.statusBadge, getStatusStyle(selectedOrder.deliveryStatus)]}>
                    <Ionicons 
                      name={getStatusIcon(selectedOrder.deliveryStatus)} 
                      size={16} 
                      color={getStatusTextStyle(selectedOrder.deliveryStatus).color} 
                    />
                    <Text style={[styles.statusText, getStatusTextStyle(selectedOrder.deliveryStatus)]}>
                      {getStatusDisplay(selectedOrder.deliveryStatus)}
                    </Text>
                  </View>
                  <Text style={styles.statusDescription}>
                    {getStatusDescription(selectedOrder.deliveryStatus)}
                  </Text>
                </View>
              </View>

              {/* Order Items */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Order Items</Text>
                <View style={styles.itemsContainer}>
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={styles.detailItem}>
                      <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemDetail}>Quantity: {item.quantity}</Text>
                          {item.color && (
                            <Text style={styles.itemDetail}>• Color: {item.color}</Text>
                          )}
                          {item.size && (
                            <Text style={styles.itemDetail}>• Size: {item.size}</Text>
                          )}
                        </View>
                        <View style={styles.itemPricing}>
                          <Text style={styles.itemPrice}>PKR {item.price} each</Text>
                          <Text style={styles.itemTotal}>
                            PKR {(item.price * item.quantity).toLocaleString()}
                          </Text>
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
                      PKR {parseFloat(selectedOrder.totalAmountAfterTax).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Shipping</Text>
                    <Text style={styles.freeText}>FREE</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax & Fees</Text>
                    <Text style={styles.includedText}>Included</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.finalTotal}>
                    <Text style={styles.finalTotalLabel}>Total Paid</Text>
                    <Text style={styles.finalTotalValue}>
                      PKR {parseFloat(selectedOrder.totalAmountAfterTax).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.supportButton}
                onPress={() => handleWhatsAppSupport(selectedOrder.orderID)}
              >
                <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
                <Text style={styles.supportButtonText}>Get Help on WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{orders.length}</Text>
            <Text style={styles.summaryLabel}>Total Orders</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {orders.filter(order => order.deliveryStatus === 'Completed').length}
            </Text>
            <Text style={styles.summaryLabel}>Delivered</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
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
              <Text style={styles.recentOrdersTitle}>Your Orders</Text>
              <Text style={styles.ordersSubtitle}>
                {orders.length} order{orders.length !== 1 ? 's' : ''} found
              </Text>
            </View>
          }
        />
      ) : (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <Ionicons name="bag-handle-outline" size={width * 0.18} color={COLORS.primaryLight} />
          </View>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptyText}>
            Your order history will appear here once you start shopping
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.replace('/(tabs)/HomeScreen')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal />
    </View>
  );
};

export default MyOrder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.06,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSpacer: {
    width: 32,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.light,
    marginHorizontal: 8,
  },
  listHeader: {
    marginBottom: 16,
  },
  recentOrdersTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  ordersSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  orderInfo: {
    flex: 1,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  itemsPreview: {
    marginBottom: 14,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemsCount: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '600',
  },
  totalBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  totalBadgeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  itemsList: {
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  itemPreview: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '500',
    flex: 1,
  },
  moreItems: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    fontStyle: 'italic',
    marginLeft: 12,
  },
  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.accentLight,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 6,
  },
  // Modal Styles
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderIconLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: COLORS.accentLight,
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  statusContent: {
    gap: 6,
  },
  statusDescription: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  modalSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
  },
  itemsContainer: {
    gap: 10,
  },
  detailItem: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  itemContent: {
    gap: 6,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
  },
  itemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemDetail: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  itemPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryCard: {
    backgroundColor: COLORS.accentLight,
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '600',
  },
  freeText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '700',
  },
  includedText: {
    fontSize: 14,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  finalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  finalTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  modalActions: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    backgroundColor: COLORS.white,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  supportButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: height * 0.15,
  },
  emptyIllustration: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});