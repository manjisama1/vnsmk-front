import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Hash, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import io from 'socket.io-client';
import { SOCKET_URL, API_ENDPOINTS } from '@/config/api';

const SessionPage = () => {
  const [qrCode, setQrCode] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('qr');
  const [qrScanned, setQrScanned] = useState(false);
  const [qrCount, setQrCount] = useState(0);
  const [qrTimer, setQrTimer] = useState(60);
  const [statusMessage, setStatusMessage] = useState('');
  const [pairingError, setPairingError] = useState('');


  const resetStates = () => {
    setQrCode('');
    setPairingCode('');
    setSessionId('');
    setLoading(false);
    setCopied(false);
    setStatusMessage('');
    setPairingError('');
    setQrTimer(0);
    setQrScanned(false);
    setQrCount(0);
    setQrTimer(60);
  };

  // Initialize socket connection only when needed
  const initializeSocket = () => {
    if (!socket) {
      console.log('🔌 Connecting to WhatsApp service...');
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);
      return newSocket;
    }
    return socket;
  };

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        console.log('🔌 Disconnecting from WhatsApp service...');
        socket.disconnect();
      }
    };
  }, [socket]);

  // Set up socket event listeners only when socket is connected
  useEffect(() => {
    if (socket) {
      console.log('📡 Setting up WhatsApp event listeners...');
      
      socket.on('qr-code', (data) => {
        setQrCode(data.qrCode);
        setQrCount(data.qrCount || 1);
        setQrScanned(false);
        setLoading(false);
        setQrTimer(60); // Reset timer to 60 seconds for new QR
        console.log('📱 QR Code received:', data.qrCount || 1);

        if (data.qrCount > 1) {
          toast.info(`Fresh QR code generated (#${data.qrCount})`);
        }
      });

      socket.on('qr-timer', (data) => {
        setQrTimer(data.timeLeft);
      });

      socket.on('qr-scanned', () => {
        setQrScanned(true);
        setQrTimer(0);
        console.log('✅ QR Code scanned');
        toast.success('QR Code scanned! Connecting...');
      });

      socket.on('qr-expired', (data) => {
        console.log('⏰ QR Code expired, resetting to fresh state');
        
        // Reset all states to initial values (like fresh page)
        setQrCode('');
        setPairingCode('');
        setSessionId('');
        setQrTimer(0);
        setLoading(false);
        setQrScanned(false);
        setQrCount(0);
        setStatusMessage('');
        
        // Disconnect and cleanup socket
        if (socket) {
          socket.disconnect();
          setSocket(null);
        }
        
        toast.error(data.message || 'QR Code expired. Click Generate to create a new one.');
      });

      socket.on('pairing-code', (data) => {
        setPairingCode(data.pairingCode);
        setLoading(false);
        setStatusMessage('');
        console.log('🔑 Pairing code received');
      });

      socket.on('session-connected', (data) => {
        setSessionId(data.sessionId);
        setQrScanned(false);
        console.log('✅ Session connected:', data.sessionId);
        toast.success('Session connected successfully!');
        setLoading(false);
      });

      return () => {
        console.log('🔌 Cleaning up event listeners...');
        socket.off('qr-code');
        socket.off('qr-timer');
        socket.off('qr-scanned');
        socket.off('qr-expired');
        socket.off('pairing-code');
        socket.off('session-connected');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket && sessionId && !sessionId.startsWith('VINSMOKEm@')) {
      socket.emit('join-session', sessionId);
    }
  }, [socket, sessionId]);

  // QR Timer countdown effect
  useEffect(() => {
    let interval = null;

    if (qrCode && !qrScanned && !sessionId?.startsWith('VINSMOKEm@')) {
      interval = setInterval(() => {
        setQrTimer((prevTimer) => {
          if (prevTimer <= 1) {
            // Timer reached 0, reset everything to fresh state
            console.log('⏰ QR Timer expired, resetting to fresh state');
            
            setTimeout(() => {
              // Reset all states to initial values
              setQrCode('');
              setPairingCode('');
              setSessionId('');
              setQrScanned(false);
              setQrCount(0);
              setStatusMessage('');
              setLoading(false);
              
              // Disconnect and cleanup socket
              if (socket) {
                socket.disconnect();
                setSocket(null);
              }
              
              toast.info('QR Code expired. Click Generate to create a new one.');
            }, 1000); // Small delay to show 0 for a moment
            
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [qrCode, qrScanned, sessionId, socket]);

  const generateQR = async () => {
    // Initialize socket connection when user clicks generate
    const activeSocket = initializeSocket();
    
    if (!activeSocket) {
      toast.error('Failed to connect to WhatsApp service');
      return;
    }

    setLoading(true);
    setQrCode('');
    setSessionId('');

    try {
      const response = await fetch(API_ENDPOINTS.session.qr, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        const tempSessionId = data.sessionId;
        // Join the session room to receive real-time updates
        activeSocket.emit('join-session', tempSessionId);
        console.log('🔗 Joined session room:', tempSessionId);

        // Set QR code if returned immediately
        if (data.qrCode) {
          setQrCode(data.qrCode);
          setLoading(false);
        }

        toast.success('QR code generated successfully!');
      } else {
        throw new Error(data.error || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR Generation Error:', error);
      toast.error(error.message || 'Failed to generate QR code');
      setLoading(false);
    }
  };

  const generatePairingCode = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    // Validate international phone number format (must start with +)
    if (!phoneNumber.startsWith('+')) {
      toast.error('Phone number must start with + followed by country code (e.g., +1234567890)');
      return;
    }

    // Validate minimum length after removing non-digits
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      toast.error('Please enter a valid phone number with country code');
      return;
    }

    // Initialize socket connection when user clicks generate
    const activeSocket = initializeSocket();
    
    if (!activeSocket) {
      toast.error('Failed to connect to WhatsApp service');
      return;
    }

    setLoading(true);
    setPairingCode('');
    setSessionId('');
    setPairingError('');
    setStatusMessage('Connecting to WhatsApp and generating pairing code...');

    try {
      const response = await fetch(API_ENDPOINTS.session.pairing, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        const tempSessionId = data.sessionId;
        // Join the session room to receive real-time updates
        activeSocket.emit('join-session', tempSessionId);
        console.log('🔗 Joined session room:', tempSessionId);

        // Set pairing code if returned immediately
        if (data.pairingCode) {
          setPairingCode(data.pairingCode);
          setLoading(false);
        }

        toast.success('Pairing code generated successfully!');
      } else {
        // Check if it's maintenance mode
        if (data.error === 'MAINTENANCE_MODE' || response.status === 503) {
          setPairingError('Pairing code is under maintenance. You can try again or use QR code method.');
          toast.error('🔧 Pairing code is under maintenance but you can still try. It might not work properly.', {
            duration: 8000,
            style: {
              background: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #F59E0B'
            }
          });
        } else {
          setPairingError(data.message || data.error || 'Failed to generate pairing code. Please try again.');
          toast.error(data.message || data.error || 'Failed to generate pairing code');
        }
      }
      setLoading(false);
      setStatusMessage('');
    } catch (error) {
      console.error('Pairing Code Generation Error:', error);
      setPairingError('Network error. Please check your connection and try again.');
      toast.error('Network error. Please try again.');
      setLoading(false);
      setStatusMessage('');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Session Management</h1>
        <p className="text-lg text-muted-foreground">
          Connect your WhatsApp account using QR code or pairing code
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => { 
        setActiveTab(value); 
        resetStates(); 
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="qr" className="text-base">
            <QrCode className="w-4 h-4 mr-2" />
            QR Code
          </TabsTrigger>
          <TabsTrigger value="pairing" className="text-base">
            <Hash className="w-4 h-4 mr-2" />
            Pairing Code
          </TabsTrigger>
        </TabsList>

        {/* QR Code Tab */}
        <TabsContent value="qr" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                Scan QR Code
              </CardTitle>
              <CardDescription>
                Open WhatsApp on your phone and scan the QR code to connect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!qrCode ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center mb-6">
                    {loading ? (
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    ) : (
                      <QrCode className="w-24 h-24 text-muted-foreground" />
                    )}
                  </div>
                  <Button
                    onClick={generateQR}
                    size="lg"
                    className="bg-primary hover:bg-primary-hover"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate QR Code'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  {!sessionId || !sessionId.startsWith('VINSMOKEm@') ? (
                    <>
                      <div className="w-64 h-64 bg-white border-4 border-primary rounded-lg flex items-center justify-center mb-6 p-4 relative">
                        <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" />

                        {/* QR Count Badge */}
                        {qrCount > 1 && (
                          <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-bold">
                            #{qrCount}
                          </div>
                        )}

                        {/* Scanning Overlay */}
                        {qrScanned && (
                          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <p className="text-primary font-medium">Connecting...</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {qrScanned ? (
                        <div className="text-center">
                          <p className="text-primary font-medium animate-pulse">Processing connection...</p>
                          <p className="text-sm text-muted-foreground mt-1">Please wait while we establish the session</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          {qrTimer > 0 ? (
                            <>
                              <p className="text-muted-foreground animate-pulse">Waiting for scan...</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                QR expires in {qrTimer}s
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-destructive animate-pulse">QR Code Expiring...</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Resetting in a moment...
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full">
                      <div className="flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-16 h-16 text-success" />
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <Label className="text-sm font-medium mb-2 block">Session ID</Label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-background px-4 py-3 rounded border border-border text-foreground font-mono text-sm">
                            {sessionId}
                          </code>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(sessionId)}
                          >
                            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pairing Code Tab */}
        <TabsContent value="pairing" className="space-y-6">
          {/* Maintenance Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <Hash className="w-5 h-5" />
              <span className="font-medium">⚠️ Maintenance Notice</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Pairing code feature is under maintenance and might not work properly. 
              You can still try it, but QR code method is more reliable.
            </p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary" />
                Pairing Code
              </CardTitle>
              <CardDescription>
                Enter your phone number with country code (e.g., +1234567890) to receive a pairing code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!pairingCode ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890 (with + and country code)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={`text-base ${phoneNumber && !phoneNumber.startsWith('+') ? 'border-red-500 focus:border-red-500' : ''}`}
                      disabled={loading}
                    />
                    {phoneNumber && !phoneNumber.startsWith('+') && (
                      <p className="text-red-500 text-sm mt-1">
                        Phone number must start with + followed by country code
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={generatePairingCode}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary-hover"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Get Pairing Code'
                    )}
                  </Button>
                  {statusMessage && (
                    <div className="text-center mt-4">
                      <p className="text-sm text-muted-foreground animate-pulse">{statusMessage}</p>
                    </div>
                  )}
                  {pairingError && (
                    <div className="text-center mt-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-700">{pairingError}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-primary/10 border-2 border-primary rounded-lg p-8 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Your Pairing Code</p>
                    <div className="text-5xl font-bold text-primary font-mono tracking-wider">
                      {pairingCode}
                    </div>
                  </div>

                  {sessionId && sessionId.startsWith('VINSMOKEm@') ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-12 h-12 text-success" />
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <Label className="text-sm font-medium mb-2 block">Session ID</Label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-background px-4 py-3 rounded border border-border text-foreground font-mono text-sm">
                            {sessionId}
                          </code>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(sessionId)}
                          >
                            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-muted-foreground animate-pulse">Waiting for connection...</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Enter this code in your WhatsApp app
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card className="mt-8 border-border">
        <CardHeader>
          <CardTitle>How to Connect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Choose Connection Method</h4>
                <p className="text-sm text-muted-foreground">
                  Select either QR Code or Pairing Code based on your preference
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Open WhatsApp</h4>
                <p className="text-sm text-muted-foreground">
                  Go to Settings → Linked Devices → Link a Device
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Complete Connection</h4>
                <p className="text-sm text-muted-foreground">
                  Scan the QR code or enter the pairing code to establish the connection
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionPage;