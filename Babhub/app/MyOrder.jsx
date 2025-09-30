

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
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from './contexts/AuthContext';


const { width, height } = Dimensions.get('window');

const MyOrder = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      if (!user?.name) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://account.babahub.co/api/order/myorder?userName=${user.name}`
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
    // Check if we can go back, otherwise navigate to a default screen
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/ProfileScreen'); // or whatever your default screen is
    }
  };

  const renderOrder = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View>
        <Text style={styles.orderId}>#{item.orderID}</Text>
        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <View style={[styles.statusBadge, getStatusStyle(item.deliveryStatus)]}>
        <View style={[styles.statusDot, getStatusDotStyle(item.deliveryStatus)]} />
        <Text style={[styles.statusText, getStatusTextStyle(item.deliveryStatus)]}>
          {item.deliveryStatus}
        </Text>
      </View>
    </View>

    <View style={styles.divider} />

    {/* Items */}
    <View style={styles.itemsContainer}>
      {item.items.map((product, index) => (
        <View key={index} style={styles.itemRow}>
          <View style={styles.bulletPoint} />
          <Text style={styles.orderItems}>
            {product.title} ({product.quantity} × PKR {product.price})
          </Text>
        </View>
      ))}
    </View>

    <View style={styles.divider} />

    {/* Total */}
    <View style={styles.cardFooter}>
      <Text style={styles.totalLabel}>Total Amount:</Text>
      <Text style={styles.orderTotal}>
        PKR {parseFloat(item.totalAmountAfterTax).toLocaleString()}
      </Text>
    </View>
  </View>
);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
        return { backgroundColor: '#e6f7ee' };
      case 'Shipped':
        return { backgroundColor: '#e6f0ff' };
      case 'Processing':
        return { backgroundColor: '#fff4e6' };

      default:
        return { backgroundColor: '#f0f0f0' };
    }
  };

  const getStatusDotStyle = (status) => {
    switch (status) {
      case 'Completed':
        return { backgroundColor: '#00b894' };
      case 'Shipped':
        return { backgroundColor: '#0984e3' };
      case 'Processing':
        return { backgroundColor: '#fdcb6e' };
   
      default:
        return { backgroundColor: '#636e72' };
    }
  };

  const getStatusTextStyle = (status) => {
    switch (status) {
      case 'Completed':
        return { color: '#00b894' };
      case 'Shipped':
        return { color: '#0984e3' };
      case 'Processing':
        return { color: '#e17055' };
      case 'Cancelled':
        return { color: '#d63031' };
      default:
        return { color: '#636e72' };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Order Count */}
      <View style={styles.orderCountContainer}>
        <Text style={styles.orderCountText}>
          {orders.length} Order{orders.length !== 1 ? 's' : ''} Found
        </Text>
      </View>

      {/* Orders List */}
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={width * 0.2} color="#ccc" />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

export default MyOrder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.06,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: width * 0.05,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 24,
  },
  orderCountContainer: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderCountText: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#666',
  },
  list: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
  },
  card: {
    backgroundColor: '#fff',
    padding: width * 0.04,
    borderRadius: 16,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: height * 0.01,
  },
  orderId: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: width * 0.035,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.008,
    borderRadius: 16,
    minWidth: width * 0.22,
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: width * 0.032,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: height * 0.015,
  },
  itemsContainer: {
    marginBottom: height * 0.01,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.008,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
    marginRight: width * 0.02,
  },
  orderItems: {
    fontSize: width * 0.038,
    color: '#444',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: width * 0.038,
    color: '#666',
    fontWeight: '500',
  },
  orderTotal: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: height * 0.02,
    fontSize: width * 0.04,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    paddingTop: height * 0.1,
  },
  emptyTitle: {
    fontSize: width * 0.06,
    fontWeight: '700',
    color: '#000',
    marginTop: height * 0.03,
    marginBottom: height * 0.01,
  },
  emptyText: {
    fontSize: width * 0.04,
    color: '#666',
    textAlign: 'center',
    marginBottom: height * 0.04,
  },
  shopButton: {
    backgroundColor: '#000',
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.02,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '600',
  },
});