import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Checkout = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  // Form state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  // Load cart items
  useEffect(() => {
    const loadCart = async () => {
      const storedCart = await AsyncStorage.getItem('cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    };
    loadCart();
  }, []);

  // Calculate order totals
  const calculateSubtotal = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const calculateTax = () => calculateSubtotal() * 0.1;
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  // Email validation
  const validateEmail = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(emailRegex.test(text) ? '' : 'Invalid email format');
  };

  // Handle checkout submission
  const handleCheckout = async () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (emailError) newErrors.email = emailError;
    if (!name) newErrors.name = 'Name is required';
    if (!address) newErrors.address = 'Address is required';
    if (!phone) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);

    const orderData = {
      name,
      email,
      phone,
      address,
      items: cartItems,
      subtotal: calculateSubtotal().toFixed(2),
      tax: calculateTax().toFixed(2),
      total: calculateTotal().toFixed(2),
    };

    try {

      // const response = await fetch("https://icellmobile.co.za/api/payfast/initiate-payment", {
      const response = await fetch("https://account.babahub.co/api/order/payfast/initiate-payment", {
      // const response = await fetch("https://f3ae168b7043.ngrok-free.app/api/order/payfast/initiate-payment", {

        
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
if (data.paymentUrl) {
  console.log("Payment URL:", data.paymentUrl);

  // Save URL before navigation
  await AsyncStorage.setItem("latestPaymentUrl", data.paymentUrl);

  router.push("PaymentScreen");
} else {
  Alert.alert("Error", "Payment initiation failed!");
}

    // if (data.paymentUrl) {
    //     window.location.href = data.paymentUrl;
    //   } else {
    //     alert("Payment initiation failed!");
    //   }
      console.log('Order data:', orderData);

      // Clear cart after successful order
      await AsyncStorage.removeItem('cart');

      // Navigate to order confirmation
      // router.push({
      //   pathname: '/OrderConfirmation',
      //   params: { orderData: JSON.stringify(orderData) },
      // });

    } catch (error) {
      Alert.alert('Error', 'There was an error processing your order. Please try again.');
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.continueText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          <View style={styles.halfInput}>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              value={email}
              onChangeText={validateEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="Phone (WhatsApp)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>
          <View style={styles.halfInput}>
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              placeholder="Address"
              value={address}
              onChangeText={setAddress}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentMethod}>
          <Ionicons name="card-outline" size={24} />
          <Text style={styles.paymentText}>Credit/Debit Card</Text>
        </View>
        <Text style={styles.paymentNote}>All transactions are secure and encrypted.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartItems.map((item, index) => (
          <View key={`${item.id}-${index}`} style={styles.orderItem}>
            <Image source={item.image} style={styles.orderItemImage} />
            <View style={styles.orderItemDetails}>
              <Text style={styles.orderItemTitle}>{item.title}</Text>
              <Text style={styles.orderItemPrice}>R{item.price.toFixed(2)} x {item.quantity}</Text>
            </View>
            <Text style={styles.orderItemTotal}>R{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>R{calculateSubtotal().toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Shipping</Text>
          <Text>Free</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Tax (10%)</Text>
          <Text>R{calculateTax().toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={[styles.summaryRow, { marginTop: 10 }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>R{calculateTotal().toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={handleCheckout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.checkoutText}>Pay Now</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    width: '48%',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentText: {
    marginLeft: 10,
    fontSize: 16,
  },
  paymentNote: {
    color: '#666',
    fontSize: 14,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  orderItemPrice: {
    fontSize: 14,
    color: '#666',
  },
  orderItemTotal: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkoutButton: {
    backgroundColor: '#000',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 15,
  },
  continueButton: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
  },
  continueText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Checkout;