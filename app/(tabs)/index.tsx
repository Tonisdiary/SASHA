// app/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Clock, Target, TrendingUp, Brain, Search as SearchIcon } from 'lucide-react-native';
import { format, subDays } from 'date-fns';
import { useStudyStore } from 'store/useStudyStore';
import { GreetingHeader } from 'components/GreetingHeader';
import { AIChatModal } from 'components/AIChatModal';
import { SearchBar } from 'components/SearchBar';
import { SearchResults } from 'components/SearchResults';
import { supabase } from 'lib/supabase';
import { searchGoogle } from 'lib/api';

// The rest of the file remains unchanged
