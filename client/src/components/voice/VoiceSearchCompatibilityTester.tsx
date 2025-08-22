import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Mic, 
  Monitor,
  Smartphone,
  Globe,
  Volume2
} from 'lucide-react';

export function VoiceSearchCompatibilityTester() {
  const [testResult, setTestResult] = useState<string>('');
  const [isTestingMic, setIsTestingMic] = useState(false);
  
  const { 
    isSupported, 
    isListening, 
    transcript,
    startListening,
    stopListening,
    getBrowserCompatibility,
    getDebugInfo
  } = useVoiceSearch({
    onResult: (result) => {
      setTestResult(result);
      setIsTestingMic(false);
    }
  });

  const compatibility = getBrowserCompatibility();
  const debugInfo = getDebugInfo();

  const runMicrophoneTest = () => {
    setIsTestingMic(true);
    setTestResult('');
    startListening();
    
    // Auto-stop after 5 seconds if still listening
    setTimeout(() => {
      if (isListening) {
        stopListening();
        setIsTestingMic(false);
      }
    }, 5000);
  };

  const copyDebugInfo = () => {
    const info = JSON.stringify(debugInfo, null, 2);
    navigator.clipboard.writeText(info);
  };

  return (
    <div className="space-y-6">
      {/* Compatibility Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Voice Search Compatibility Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Browser Support Status */}
          <div className="flex items-center gap-3">
            {isSupported ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <div>
              <p className="font-semibold">
                Voice Search {isSupported ? 'Supported' : 'Not Supported'}
              </p>
              <p className="text-sm text-gray-600">
                {isSupported 
                  ? 'Your browser supports speech recognition'
                  : 'Speech recognition is not available in your browser'
                }
              </p>
            </div>
          </div>

          {/* Browser Detection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Badge variant={compatibility.chrome ? 'default' : 'secondary'}>
              {compatibility.chrome ? '✓' : '✗'} Chrome
            </Badge>
            <Badge variant={compatibility.edge ? 'default' : 'secondary'}>
              {compatibility.edge ? '✓' : '✗'} Edge
            </Badge>
            <Badge variant={compatibility.firefox ? 'default' : 'secondary'}>
              {compatibility.firefox ? '✓' : '✗'} Firefox
            </Badge>
            <Badge variant={compatibility.safari ? 'default' : 'secondary'}>
              {compatibility.safari ? '✓' : '✗'} Safari
            </Badge>
          </div>

          {/* Device Type */}
          <div className="flex items-center gap-2">
            {compatibility.mobile ? (
              <Smartphone className="w-4 h-4" />
            ) : (
              <Monitor className="w-4 h-4" />
            )}
            <span className="text-sm">
              {compatibility.mobile ? 'Mobile Device' : 'Desktop Device'}
            </span>
          </div>

          {/* Recommendations */}
          {!isSupported && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Recommendation:</strong> {compatibility.recommendedBrowser}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Microphone Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Microphone Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={runMicrophoneTest}
              disabled={!isSupported || isTestingMic}
              variant={isTestingMic ? 'destructive' : 'default'}
              className="flex items-center gap-2"
            >
              <Mic className={`w-4 h-4 ${isTestingMic ? 'animate-pulse' : ''}`} />
              {isTestingMic ? 'Listening...' : 'Test Microphone'}
            </Button>
            
            {isTestingMic && (
              <Button
                onClick={() => {
                  stopListening();
                  setIsTestingMic(false);
                }}
                variant="outline"
                size="sm"
              >
                Stop Test
              </Button>
            )}
          </div>

          {/* Real-time transcript during test */}
          {isTestingMic && transcript && (
            <div className="p-3 bg-blue-50 rounded-lg border">
              <p className="text-sm text-blue-800">
                <Volume2 className="w-4 h-4 inline mr-2" />
                Hearing: "{transcript}"
              </p>
            </div>
          )}

          {/* Test results */}
          {testResult && (
            <div className="p-3 bg-green-50 rounded-lg border">
              <p className="text-sm text-green-800">
                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                Test successful! Recognized: "{testResult}"
              </p>
            </div>
          )}

          {!isSupported && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Microphone test not available. Voice search is not supported in your current browser.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-x-auto">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
          <Button onClick={copyDebugInfo} variant="outline" size="sm">
            Copy Debug Info
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}