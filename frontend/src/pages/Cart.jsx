import React from 'react';
import { useShopStore } from '../stores/shopStore';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkout,
    getCartTotal,
    getCartCount
  } = useShopStore();

  if (cart.length === 0) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div style={{
            padding: '40px 20px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <h1 className="heading-gold" style={{ marginBottom: '40px' }}>
              <ShoppingBag size={32} style={{ display: 'inline-block', marginRight: '12px', verticalAlign: 'middle' }} /> Giỏ Hàng
            </h1>

            <div className="card-glass" style={{
              padding: '60px',
              textAlign: 'center'
            }}>
              <ShoppingBag size={64} style={{
                color: 'rgba(255, 255, 255, 0.3)',
                marginBottom: '24px'
              }} />
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '16px'
              }}>
                Giỏ Hàng Trống
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '32px'
              }}>
                Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
              </p>
              <button
                className="btn-primary"
                onClick={() => navigate('/shop')}
              >
                <ShoppingBag size={20} />
                <span>Tiếp Tục Mua Sắm</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <div style={{
          padding: '40px 20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <h1 className="heading-gold">
              <ShoppingBag size={32} style={{ display: 'inline-block', marginRight: '12px', verticalAlign: 'middle' }} /> Giỏ Hàng ({getCartCount()} sản phẩm)
            </h1>

            <button
              className="btn-secondary"
              onClick={clearCart}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#EF4444',
                color: '#EF4444'
              }}
            >
              <Trash2 size={16} />
              <span>Xóa Tất Cả</span>
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '32px'
          }}>
            {/* Cart Items */}
            <div>
              {cart.map((item) => {
                const variant = item.product.variants.edges
                  .find(v => v.node.id === item.variantId)?.node;
                const image = item.product.images.edges[0]?.node;
                const price = parseFloat(variant?.priceV2.amount || 0);
                const subtotal = price * item.quantity;

                return (
                  <div
                    key={item.variantId}
                    className="card-glass"
                    style={{
                      padding: '24px',
                      marginBottom: '16px',
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr auto',
                      gap: '24px',
                      alignItems: 'center'
                    }}
                  >
                    {/* Product Image */}
                    <img
                      src={image?.url}
                      alt={item.product.title}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />

                    {/* Product Info */}
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        marginBottom: '8px'
                      }}>
                        {item.product.title}
                      </h3>
                      {variant.title !== 'Default Title' && (
                        <p style={{
                          fontSize: '14px',
                          color: 'rgba(255, 255, 255, 0.6)',
                          marginBottom: '16px'
                        }}>
                          Phiên bản: {variant.title}
                        </p>
                      )}

                      {/* Quantity Controls */}
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                      }}>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          style={{
                            padding: '8px 12px',
                            background: 'rgba(17, 34, 80, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '6px',
                            color: '#FFFFFF',
                            cursor: 'pointer'
                          }}
                        >
                          <Minus size={16} />
                        </button>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          minWidth: '32px',
                          textAlign: 'center'
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          style={{
                            padding: '8px 12px',
                            background: 'rgba(17, 34, 80, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '6px',
                            color: '#FFFFFF',
                            cursor: 'pointer'
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 900,
                        color: '#FFBD59',
                        marginBottom: '16px'
                      }}>
                        {subtotal.toLocaleString('vi-VN')}₫
                      </div>
                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid #EF4444',
                          borderRadius: '6px',
                          color: '#EF4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                      >
                        <Trash2 size={14} />
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div>
              <div className="card-glass" style={{
                padding: '32px',
                position: 'sticky',
                top: '100px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginBottom: '24px'
                }}>
                  Tóm Tắt Đơn Hàng
                </h3>

                {/* Subtotal */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <span>Tạm tính:</span>
                  <span>{getCartTotal().toLocaleString('vi-VN')}₫</span>
                </div>

                {/* Shipping */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <span>Phí vận chuyển:</span>
                  <span>Miễn phí</span>
                </div>

                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                  margin: '24px 0',
                  paddingTop: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#FFBD59'
                  }}>
                    <span>Tổng cộng:</span>
                    <span>{getCartTotal().toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  className="btn-warning"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    marginBottom: '16px'
                  }}
                  onClick={checkout}
                >
                  <span>Thanh Toán</span>
                  <ArrowRight size={20} />
                </button>

                <button
                  className="btn-secondary"
                  style={{ width: '100%' }}
                  onClick={() => navigate('/shop')}
                >
                  <span>Tiếp Tục Mua Sắm</span>
                </button>

                {/* Payment Methods */}
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: 'rgba(17, 34, 80, 0.4)',
                  borderRadius: '8px'
                }}>
                  <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '12px'
                  }}>
                    Chấp nhận thanh toán:
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    {['Thẻ', 'Chuyển khoản', 'Momo', 'COD'].map(method => (
                      <span
                        key={method}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: 'rgba(255, 255, 255, 0.8)'
                        }}
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
