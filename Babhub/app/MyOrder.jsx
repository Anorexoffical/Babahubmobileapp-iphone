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
    const phoneNumber = '+923001234567'; // Replace with your support number
    const message = `Hello, I need help with my order ${orderId}. Can you assist me?`;
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.openURL(url).catch(() => {
      alert('WhatsApp is not installed on your device');
    });
  };

  // const handleReorder = (order) => {
  //   // Implement reorder functionality
  //   alert(`Reorder functionality for ${formatOrderId(order.orderID)} would be implemented here`);
  // };

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
            <Ionicons name="receipt-outline" size={16} color={COLORS.primary} />
            <Text style={styles.orderId} numberOfLines={1}>
              {formatOrderId(item.orderID)}
            </Text>
          </View>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        
        <View style={[styles.statusBadge, getStatusStyle(item.deliveryStatus)]}>
          <Ionicons 
            name={getStatusIcon(item.deliveryStatus)} 
            size={14} 
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
            PKR {parseFloat(item.totalAmountAfterTax).toLocaleString()}
          </Text>
        </View>
        
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
                <Text style={styles.modalTitle}>Order Details</Text>
                <Text style={styles.modalSubtitle}>
                  {formatOrderId(selectedOrder.orderID)} • {formatDate(selectedOrder.createdAt)}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={hideOrderDetails}
              >
                <Ionicons name="close" size={24} color={COLORS.gray} />
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
                      size={28} 
                      color={getStatusTextStyle(selectedOrder.deliveryStatus).color} 
                    />
                  </View>
                  <View style={styles.statusContent}>
                    <Text style={styles.statusTitle}>Order Status</Text>
                    <View style={[styles.statusBadgeLarge, getStatusStyle(selectedOrder.deliveryStatus)]}>
                      <Ionicons 
                        name={getStatusIcon(selectedOrder.deliveryStatus)} 
                        size={16} 
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
                            <Text style={styles.itemPrice}>PKR {parseFloat(item.price).toLocaleString()} each</Text>
                            <Text style={styles.itemTotal}>
                              PKR {(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString()}
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
                      PKR {subtotal.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Shipping Fee</Text>
                    <Text style={styles.freeText}>FREE</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax & Charges</Text>
                    <Text style={styles.summaryValue}>
                      PKR {(totalAmount - subtotal).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.finalTotal}>
                    <Text style={styles.finalTotalLabel}>Total Paid</Text>
                    <Text style={styles.finalTotalValue}>
                      PKR {totalAmount.toLocaleString()}
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
                <Ionicons name="logo-whatsapp" size={18} color={COLORS.white} />
                <Text style={styles.whatsappButtonText}>Get Help</Text>
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
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
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
      
      {/* Header - Fixed without extra space */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Ionicons name="receipt" size={20} color={COLORS.primary} />
            <Text style={styles.summaryNumber}>{orders.length}</Text>
            <Text style={styles.summaryLabel}>Total Orders</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.summaryNumber}>
              {orders.filter(order => order.deliveryStatus === 'Completed').length}
            </Text>
            <Text style={styles.summaryLabel}>Delivered</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="time" size={20} color={COLORS.warning} />
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
            <Ionicons name="bag-handle-outline" size={width * 0.25} color={COLORS.grayLight} />
          </View>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptyText}>
            When you place orders, they will appear here with all the details
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.replace('/(tabs)/HomeScreen')}
          >
            <Ionicons name="storefront-outline" size={20} color={COLORS.white} />
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
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
    paddingTop: height * 0.06,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: width * 0.045,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
  },
  summaryContainer: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.015,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: width * 0.05,
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: width * 0.028,
    color: COLORS.gray,
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.light,
    marginHorizontal: 8,
  },
  listHeader: {
    marginBottom: 12,
    paddingTop: 8,
  },
  recentOrdersTitle: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 2,
  },
  ordersSubtitle: {
    fontSize: width * 0.032,
    color: COLORS.gray,
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: width * 0.038,
    fontWeight: '700',
    color: COLORS.dark,
    marginLeft: 6,
    flex: 1,
  },
  orderDate: {
    fontSize: width * 0.03,
    color: COLORS.gray,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  statusText: {
    fontSize: width * 0.028,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  itemsPreview: {
    marginBottom: 12,
  },
  itemsCount: {
    fontSize: width * 0.032,
    color: COLORS.gray,
    fontWeight: '600',
    marginBottom: 6,
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
    fontSize: width * 0.035,
    color: COLORS.dark,
    fontWeight: '500',
    flex: 1,
  },
  moreItems: {
    fontSize: width * 0.032,
    color: COLORS.primary,
    fontWeight: '600',
    fontStyle: 'italic',
    marginLeft: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: width * 0.032,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 2,
  },
  orderTotal: {
    fontSize: width * 0.04,
    fontWeight: '800',
    color: COLORS.primary,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '08',
  },
  detailsButtonText: {
    fontSize: width * 0.032,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 4,
  },
  // Modal Styles - IMPROVED
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    flex: 1,
  },
  modalTitle: {
    fontSize: width * 0.045,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: width * 0.032,
    color: COLORS.gray,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  // Enhanced Status Card
  statusCard: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 16,
    marginVertical: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  statusIconMain: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  statusContent: {
    flex: 1,
    gap: 8,
  },
  statusTitle: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: COLORS.gray,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  statusTextLarge: {
    fontSize: width * 0.032,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statusDescription: {
    fontSize: width * 0.033,
    color: COLORS.gray,
    lineHeight: 18,
  },
  modalSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: width * 0.038,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
  },
  itemsContainer: {
    gap: 10,
  },
  orderItemCard: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.light,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  itemContent: {
    gap: 10,
  },
  itemTitle: {
    fontSize: width * 0.036,
    fontWeight: '600',
    color: COLORS.dark,
    lineHeight: 20,
  },
  itemVariants: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  variantChip: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  variantText: {
    fontSize: width * 0.03,
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
    gap: 6,
  },
  quantityLabel: {
    fontSize: width * 0.032,
    color: COLORS.gray,
    fontWeight: '500',
  },
  quantityValue: {
    fontSize: width * 0.032,
    color: COLORS.dark,
    fontWeight: '600',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: width * 0.032,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: width * 0.035,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryCard: {
    backgroundColor: COLORS.background,
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
    fontSize: width * 0.035,
    color: COLORS.gray,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: width * 0.035,
    color: COLORS.dark,
    fontWeight: '600',
  },
  freeText: {
    fontSize: width * 0.035,
    color: COLORS.success,
    fontWeight: '700',
  },
  finalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary + '30',
  },
  finalTotalLabel: {
    fontSize: width * 0.038,
    fontWeight: '700',
    color: COLORS.dark,
  },
  finalTotalValue: {
    fontSize: width * 0.04,
    fontWeight: '800',
    color: COLORS.primary,
  },
  // Enhanced Modal Actions
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    backgroundColor: COLORS.white,
  },
  reorderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  reorderButtonText: {
    color: COLORS.primary,
    fontSize: width * 0.036,
    fontWeight: '600',
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.whatsapp,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.whatsapp,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  whatsappButtonText: {
    color: COLORS.white,
    fontSize: width * 0.036,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: height * 0.02,
    fontSize: width * 0.038,
    color: COLORS.gray,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    paddingTop: height * 0.05,
  },
  emptyIllustration: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: width * 0.055,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: width * 0.038,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: width * 0.038,
    fontWeight: '700',
  },
});