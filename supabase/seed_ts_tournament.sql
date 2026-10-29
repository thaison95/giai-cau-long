-- Seed script for Trusting Social Badminton Tournament
-- Tournament ID: c90dd0b1-a512-412b-ba3c-e7ae4d40db73

DO $$
DECLARE
  v_tourney_id uuid := 'c90dd0b1-a512-412b-ba3c-e7ae4d40db73';
  v_group_id uuid;
  v_team_1 uuid;
  v_team_2 uuid;
  v_team_3 uuid;
  v_team_4 uuid;
  v_team_5 uuid;
  v_team_6 uuid;
  v_p_1_Q_Long uuid;
  v_p_1_Sang uuid;
  v_p_1_Nhân uuid;
  v_p_1_P_Long uuid;
  v_p_1_Bảo uuid;
  v_p_1_Thảo uuid;
  v_p_2_Giang uuid;
  v_p_2_Tú uuid;
  v_p_2_Luân uuid;
  v_p_2_Thiên uuid;
  v_p_2_Gương uuid;
  v_p_2_Phúc uuid;
  v_p_3_Dũng uuid;
  v_p_3_Minh uuid;
  v_p_3_Huy uuid;
  v_p_3_Khánh uuid;
  v_p_3_Đức uuid;
  v_p_3_Oanh uuid;
  v_p_4_Xuân uuid;
  v_p_4_An uuid;
  v_p_4_Sơn uuid;
  v_p_4_Nhực uuid;
  v_p_4_Tuấn uuid;
  v_p_4_Nhi uuid;
  v_p_5_Quân uuid;
  v_p_5_Hào uuid;
  v_p_5_Tâm uuid;
  v_p_5_Nhu_Em uuid;
  v_p_5_Hồng uuid;
  v_p_5_Hạnh uuid;
  v_p_6_Cường uuid;
  v_p_6_K_Đào uuid;
  v_p_6_Triết uuid;
  v_p_6_Bình uuid;
  v_p_6_T_Huy uuid;
  v_p_6_Mindy uuid;
  v_tie_id uuid;
  v_rub_1 uuid; v_rub_2 uuid; v_rub_3 uuid;
BEGIN

  -- 1. Tạo hoặc lấy Bảng A
  SELECT id INTO v_group_id FROM public.tournament_groups WHERE tournament_id = v_tourney_id AND name = 'Bảng A' LIMIT 1;
  IF v_group_id IS NULL THEN
    INSERT INTO public.tournament_groups(tournament_id, name, sort_order)
    VALUES (v_tourney_id, 'Bảng A', 1)
    RETURNING id INTO v_group_id;
  END IF;

  -- 2. Tạo 6 Đội
  SELECT id INTO v_team_1 FROM public.teams WHERE tournament_id = v_tourney_id AND short_name = 'Đ1' LIMIT 1;
  IF v_team_1 IS NULL THEN
    INSERT INTO public.teams(tournament_id, group_id, name, short_name, flag_emoji, seed)
    VALUES (v_tourney_id, v_group_id, 'Đội 1', 'Đ1', '1️⃣', 1)
    RETURNING id INTO v_team_1;
  ELSE
    UPDATE public.teams SET group_id = v_group_id, flag_emoji = '1️⃣', name = 'Đội 1', seed = 1 WHERE id = v_team_1;
  END IF;
  SELECT id INTO v_team_2 FROM public.teams WHERE tournament_id = v_tourney_id AND short_name = 'Đ2' LIMIT 1;
  IF v_team_2 IS NULL THEN
    INSERT INTO public.teams(tournament_id, group_id, name, short_name, flag_emoji, seed)
    VALUES (v_tourney_id, v_group_id, 'Đội 2', 'Đ2', '2️⃣', 2)
    RETURNING id INTO v_team_2;
  ELSE
    UPDATE public.teams SET group_id = v_group_id, flag_emoji = '2️⃣', name = 'Đội 2', seed = 2 WHERE id = v_team_2;
  END IF;
  SELECT id INTO v_team_3 FROM public.teams WHERE tournament_id = v_tourney_id AND short_name = 'Đ3' LIMIT 1;
  IF v_team_3 IS NULL THEN
    INSERT INTO public.teams(tournament_id, group_id, name, short_name, flag_emoji, seed)
    VALUES (v_tourney_id, v_group_id, 'Đội 3', 'Đ3', '3️⃣', 3)
    RETURNING id INTO v_team_3;
  ELSE
    UPDATE public.teams SET group_id = v_group_id, flag_emoji = '3️⃣', name = 'Đội 3', seed = 3 WHERE id = v_team_3;
  END IF;
  SELECT id INTO v_team_4 FROM public.teams WHERE tournament_id = v_tourney_id AND short_name = 'Đ4' LIMIT 1;
  IF v_team_4 IS NULL THEN
    INSERT INTO public.teams(tournament_id, group_id, name, short_name, flag_emoji, seed)
    VALUES (v_tourney_id, v_group_id, 'Đội 4', 'Đ4', '4️⃣', 4)
    RETURNING id INTO v_team_4;
  ELSE
    UPDATE public.teams SET group_id = v_group_id, flag_emoji = '4️⃣', name = 'Đội 4', seed = 4 WHERE id = v_team_4;
  END IF;
  SELECT id INTO v_team_5 FROM public.teams WHERE tournament_id = v_tourney_id AND short_name = 'Đ5' LIMIT 1;
  IF v_team_5 IS NULL THEN
    INSERT INTO public.teams(tournament_id, group_id, name, short_name, flag_emoji, seed)
    VALUES (v_tourney_id, v_group_id, 'Đội 5', 'Đ5', '5️⃣', 5)
    RETURNING id INTO v_team_5;
  ELSE
    UPDATE public.teams SET group_id = v_group_id, flag_emoji = '5️⃣', name = 'Đội 5', seed = 5 WHERE id = v_team_5;
  END IF;
  SELECT id INTO v_team_6 FROM public.teams WHERE tournament_id = v_tourney_id AND short_name = 'Đ6' LIMIT 1;
  IF v_team_6 IS NULL THEN
    INSERT INTO public.teams(tournament_id, group_id, name, short_name, flag_emoji, seed)
    VALUES (v_tourney_id, v_group_id, 'Đội 6', 'Đ6', '6️⃣', 6)
    RETURNING id INTO v_team_6;
  ELSE
    UPDATE public.teams SET group_id = v_group_id, flag_emoji = '6️⃣', name = 'Đội 6', seed = 6 WHERE id = v_team_6;
  END IF;

  -- 3. Tạo Vận động viên cho từng đội

  -- VĐV Đội 1
  SELECT id INTO v_p_1_Q_Long FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_1 AND full_name = 'Q.Long' LIMIT 1;
  IF v_p_1_Q_Long IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_1, 'Q.Long', 'm', 1)
    RETURNING id INTO v_p_1_Q_Long;
  END IF;
  SELECT id INTO v_p_1_Sang FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_1 AND full_name = 'Sang' LIMIT 1;
  IF v_p_1_Sang IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_1, 'Sang', 'm', 2)
    RETURNING id INTO v_p_1_Sang;
  END IF;
  SELECT id INTO v_p_1_Nhân FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_1 AND full_name = 'Nhân' LIMIT 1;
  IF v_p_1_Nhân IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_1, 'Nhân', 'm', 3)
    RETURNING id INTO v_p_1_Nhân;
  END IF;
  SELECT id INTO v_p_1_P_Long FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_1 AND full_name = 'P.Long' LIMIT 1;
  IF v_p_1_P_Long IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_1, 'P.Long', 'm', 4)
    RETURNING id INTO v_p_1_P_Long;
  END IF;
  SELECT id INTO v_p_1_Bảo FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_1 AND full_name = 'Bảo' LIMIT 1;
  IF v_p_1_Bảo IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_1, 'Bảo', 'm', 5)
    RETURNING id INTO v_p_1_Bảo;
  END IF;
  SELECT id INTO v_p_1_Thảo FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_1 AND full_name = 'Thảo' LIMIT 1;
  IF v_p_1_Thảo IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_1, 'Thảo', 'f', 6)
    RETURNING id INTO v_p_1_Thảo;
  END IF;

  -- VĐV Đội 2
  SELECT id INTO v_p_2_Giang FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_2 AND full_name = 'Giang' LIMIT 1;
  IF v_p_2_Giang IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_2, 'Giang', 'm', 1)
    RETURNING id INTO v_p_2_Giang;
  END IF;
  SELECT id INTO v_p_2_Tú FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_2 AND full_name = 'Tú' LIMIT 1;
  IF v_p_2_Tú IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_2, 'Tú', 'm', 2)
    RETURNING id INTO v_p_2_Tú;
  END IF;
  SELECT id INTO v_p_2_Luân FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_2 AND full_name = 'Luân' LIMIT 1;
  IF v_p_2_Luân IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_2, 'Luân', 'm', 3)
    RETURNING id INTO v_p_2_Luân;
  END IF;
  SELECT id INTO v_p_2_Thiên FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_2 AND full_name = 'Thiên' LIMIT 1;
  IF v_p_2_Thiên IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_2, 'Thiên', 'm', 4)
    RETURNING id INTO v_p_2_Thiên;
  END IF;
  SELECT id INTO v_p_2_Gương FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_2 AND full_name = 'Gương' LIMIT 1;
  IF v_p_2_Gương IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_2, 'Gương', 'f', 5)
    RETURNING id INTO v_p_2_Gương;
  END IF;
  SELECT id INTO v_p_2_Phúc FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_2 AND full_name = 'Phúc' LIMIT 1;
  IF v_p_2_Phúc IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_2, 'Phúc', 'f', 6)
    RETURNING id INTO v_p_2_Phúc;
  END IF;

  -- VĐV Đội 3
  SELECT id INTO v_p_3_Dũng FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_3 AND full_name = 'Dũng' LIMIT 1;
  IF v_p_3_Dũng IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_3, 'Dũng', 'm', 1)
    RETURNING id INTO v_p_3_Dũng;
  END IF;
  SELECT id INTO v_p_3_Minh FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_3 AND full_name = 'Minh' LIMIT 1;
  IF v_p_3_Minh IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_3, 'Minh', 'm', 2)
    RETURNING id INTO v_p_3_Minh;
  END IF;
  SELECT id INTO v_p_3_Huy FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_3 AND full_name = 'Huy' LIMIT 1;
  IF v_p_3_Huy IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_3, 'Huy', 'm', 3)
    RETURNING id INTO v_p_3_Huy;
  END IF;
  SELECT id INTO v_p_3_Khánh FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_3 AND full_name = 'Khánh' LIMIT 1;
  IF v_p_3_Khánh IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_3, 'Khánh', 'm', 4)
    RETURNING id INTO v_p_3_Khánh;
  END IF;
  SELECT id INTO v_p_3_Đức FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_3 AND full_name = 'Đức' LIMIT 1;
  IF v_p_3_Đức IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_3, 'Đức', 'm', 5)
    RETURNING id INTO v_p_3_Đức;
  END IF;
  SELECT id INTO v_p_3_Oanh FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_3 AND full_name = 'Oanh' LIMIT 1;
  IF v_p_3_Oanh IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_3, 'Oanh', 'f', 6)
    RETURNING id INTO v_p_3_Oanh;
  END IF;

  -- VĐV Đội 4
  SELECT id INTO v_p_4_Xuân FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_4 AND full_name = 'Xuân' LIMIT 1;
  IF v_p_4_Xuân IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_4, 'Xuân', 'm', 1)
    RETURNING id INTO v_p_4_Xuân;
  END IF;
  SELECT id INTO v_p_4_An FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_4 AND full_name = 'An' LIMIT 1;
  IF v_p_4_An IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_4, 'An', 'm', 2)
    RETURNING id INTO v_p_4_An;
  END IF;
  SELECT id INTO v_p_4_Sơn FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_4 AND full_name = 'Sơn' LIMIT 1;
  IF v_p_4_Sơn IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_4, 'Sơn', 'm', 3)
    RETURNING id INTO v_p_4_Sơn;
  END IF;
  SELECT id INTO v_p_4_Nhực FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_4 AND full_name = 'Nhực' LIMIT 1;
  IF v_p_4_Nhực IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_4, 'Nhực', 'm', 4)
    RETURNING id INTO v_p_4_Nhực;
  END IF;
  SELECT id INTO v_p_4_Tuấn FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_4 AND full_name = 'Tuấn' LIMIT 1;
  IF v_p_4_Tuấn IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_4, 'Tuấn', 'm', 5)
    RETURNING id INTO v_p_4_Tuấn;
  END IF;
  SELECT id INTO v_p_4_Nhi FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_4 AND full_name = 'Nhi' LIMIT 1;
  IF v_p_4_Nhi IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_4, 'Nhi', 'f', 6)
    RETURNING id INTO v_p_4_Nhi;
  END IF;

  -- VĐV Đội 5
  SELECT id INTO v_p_5_Quân FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_5 AND full_name = 'Quân' LIMIT 1;
  IF v_p_5_Quân IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_5, 'Quân', 'm', 1)
    RETURNING id INTO v_p_5_Quân;
  END IF;
  SELECT id INTO v_p_5_Hào FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_5 AND full_name = 'Hào' LIMIT 1;
  IF v_p_5_Hào IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_5, 'Hào', 'm', 2)
    RETURNING id INTO v_p_5_Hào;
  END IF;
  SELECT id INTO v_p_5_Tâm FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_5 AND full_name = 'Tâm' LIMIT 1;
  IF v_p_5_Tâm IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_5, 'Tâm', 'm', 3)
    RETURNING id INTO v_p_5_Tâm;
  END IF;
  SELECT id INTO v_p_5_Nhu_Em FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_5 AND full_name = 'Nhu Em' LIMIT 1;
  IF v_p_5_Nhu_Em IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_5, 'Nhu Em', 'm', 4)
    RETURNING id INTO v_p_5_Nhu_Em;
  END IF;
  SELECT id INTO v_p_5_Hồng FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_5 AND full_name = 'Hồng' LIMIT 1;
  IF v_p_5_Hồng IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_5, 'Hồng', 'f', 5)
    RETURNING id INTO v_p_5_Hồng;
  END IF;
  SELECT id INTO v_p_5_Hạnh FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_5 AND full_name = 'Hạnh' LIMIT 1;
  IF v_p_5_Hạnh IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_5, 'Hạnh', 'f', 6)
    RETURNING id INTO v_p_5_Hạnh;
  END IF;

  -- VĐV Đội 6
  SELECT id INTO v_p_6_Cường FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_6 AND full_name = 'Cường' LIMIT 1;
  IF v_p_6_Cường IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_6, 'Cường', 'm', 1)
    RETURNING id INTO v_p_6_Cường;
  END IF;
  SELECT id INTO v_p_6_K_Đào FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_6 AND full_name = 'K.Đào' LIMIT 1;
  IF v_p_6_K_Đào IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_6, 'K.Đào', 'm', 2)
    RETURNING id INTO v_p_6_K_Đào;
  END IF;
  SELECT id INTO v_p_6_Triết FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_6 AND full_name = 'Triết' LIMIT 1;
  IF v_p_6_Triết IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_6, 'Triết', 'm', 3)
    RETURNING id INTO v_p_6_Triết;
  END IF;
  SELECT id INTO v_p_6_Bình FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_6 AND full_name = 'Bình' LIMIT 1;
  IF v_p_6_Bình IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_6, 'Bình', 'm', 4)
    RETURNING id INTO v_p_6_Bình;
  END IF;
  SELECT id INTO v_p_6_T_Huy FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_6 AND full_name = 'T.Huy' LIMIT 1;
  IF v_p_6_T_Huy IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_6, 'T.Huy', 'm', 5)
    RETURNING id INTO v_p_6_T_Huy;
  END IF;
  SELECT id INTO v_p_6_Mindy FROM public.players WHERE tournament_id = v_tourney_id AND team_id = v_team_6 AND full_name = 'Mindy' LIMIT 1;
  IF v_p_6_Mindy IS NULL THEN
    INSERT INTO public.players(tournament_id, team_id, full_name, gender, sort_order)
    VALUES (v_tourney_id, v_team_6, 'Mindy', 'f', 6)
    RETURNING id INTO v_p_6_Mindy;
  END IF;

  -- 4. Tạo 15 Trận đồng đội (Ties) và Lineup theo ma trận

  -- Tie #1: Đội 1 vs Đội 2
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_1 AND team_b_id = v_team_2) OR (team_a_id = v_team_2 AND team_b_id = v_team_1)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 1 vs Đội 2', 1, v_team_1, v_team_2, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Q_Long) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Sang) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_2_Giang) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_2_Tú) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_Nhân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_P_Long) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_2_Luân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_2_Thiên) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Bảo) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Thảo) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_2_Giang) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_2_Gương) ON CONFLICT DO NOTHING;

  -- Tie #2: Đội 1 vs Đội 3
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_1 AND team_b_id = v_team_3) OR (team_a_id = v_team_3 AND team_b_id = v_team_1)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 1 vs Đội 3', 2, v_team_1, v_team_3, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Bảo) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Q_Long) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_3_Dũng) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_3_Minh) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_Nhân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_P_Long) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_3_Huy) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_3_Khánh) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Sang) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Thảo) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_3_Đức) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_3_Oanh) ON CONFLICT DO NOTHING;

  -- Tie #3: Đội 1 vs Đội 4
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_1 AND team_b_id = v_team_4) OR (team_a_id = v_team_4 AND team_b_id = v_team_1)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 1 vs Đội 4', 3, v_team_1, v_team_4, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Nhân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Bảo) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_4_Xuân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_4_An) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_Q_Long) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_Sang) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_4_Sơn) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_4_Nhực) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_P_Long) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Thảo) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_4_Tuấn) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_4_Nhi) ON CONFLICT DO NOTHING;

  -- Tie #4: Đội 1 vs Đội 5
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_1 AND team_b_id = v_team_5) OR (team_a_id = v_team_5 AND team_b_id = v_team_1)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 1 vs Đội 5', 4, v_team_1, v_team_5, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Q_Long) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Sang) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Quân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Hào) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_Nhân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_P_Long) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Tâm) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Nhu_Em) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Bảo) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Thảo) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Quân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Hồng) ON CONFLICT DO NOTHING;

  -- Tie #5: Đội 1 vs Đội 6
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_1 AND team_b_id = v_team_6) OR (team_a_id = v_team_6 AND team_b_id = v_team_1)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 1 vs Đội 6', 5, v_team_1, v_team_6, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Bảo) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_1_Q_Long) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_Cường) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_K_Đào) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_Nhân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_1_P_Long) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_Triết) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_Bình) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Sang) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_1_Thảo) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_T_Huy) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_Mindy) ON CONFLICT DO NOTHING;

  -- Tie #6: Đội 2 vs Đội 3
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_2 AND team_b_id = v_team_3) OR (team_a_id = v_team_3 AND team_b_id = v_team_2)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 2 vs Đội 3', 6, v_team_2, v_team_3, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Giang) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Luân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_3_Dũng) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_3_Minh) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Tú) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Thiên) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_3_Huy) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_3_Khánh) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Giang) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Phúc) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_3_Đức) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_3_Oanh) ON CONFLICT DO NOTHING;

  -- Tie #7: Đội 2 vs Đội 4
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_2 AND team_b_id = v_team_4) OR (team_a_id = v_team_4 AND team_b_id = v_team_2)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 2 vs Đội 4', 7, v_team_2, v_team_4, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Giang) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Thiên) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_4_Xuân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_4_Sơn) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Tú) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Luân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_4_Nhực) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_4_Tuấn) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Tú) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Phúc) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_4_An) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_4_Nhi) ON CONFLICT DO NOTHING;

  -- Tie #8: Đội 2 vs Đội 5
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_2 AND team_b_id = v_team_5) OR (team_a_id = v_team_5 AND team_b_id = v_team_2)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 2 vs Đội 5', 8, v_team_2, v_team_5, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Giang) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Thiên) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Quân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Tâm) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Tú) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Luân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Hào) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Nhu_Em) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Giang) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Phúc) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Tâm) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Hạnh) ON CONFLICT DO NOTHING;

  -- Tie #9: Đội 2 vs Đội 6
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_2 AND team_b_id = v_team_6) OR (team_a_id = v_team_6 AND team_b_id = v_team_2)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 2 vs Đội 6', 9, v_team_2, v_team_6, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Giang) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_2_Tú) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_Cường) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_T_Huy) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Luân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_2_Thiên) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_K_Đào) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_Bình) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Luân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_2_Gương) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_Triết) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_Mindy) ON CONFLICT DO NOTHING;

  -- Tie #10: Đội 3 vs Đội 4
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_3 AND team_b_id = v_team_4) OR (team_a_id = v_team_4 AND team_b_id = v_team_3)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 3 vs Đội 4', 10, v_team_3, v_team_4, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_3_Dũng) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_3_Minh) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_4_Xuân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_4_An) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_3_Huy) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_3_Khánh) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_4_Sơn) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_4_Nhực) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_3_Đức) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_3_Oanh) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_4_Tuấn) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_4_Nhi) ON CONFLICT DO NOTHING;

  -- Tie #11: Đội 3 vs Đội 5
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_3 AND team_b_id = v_team_5) OR (team_a_id = v_team_5 AND team_b_id = v_team_3)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 3 vs Đội 5', 11, v_team_3, v_team_5, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_3_Dũng) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_3_Minh) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Tâm) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Hào) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_3_Huy) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_3_Khánh) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Quân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Nhu_Em) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_3_Đức) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_3_Oanh) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Hào) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Hồng) ON CONFLICT DO NOTHING;

  -- Tie #12: Đội 3 vs Đội 6
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_3 AND team_b_id = v_team_6) OR (team_a_id = v_team_6 AND team_b_id = v_team_3)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 3 vs Đội 6', 12, v_team_3, v_team_6, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_3_Dũng) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_3_Minh) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_Triết) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_K_Đào) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_3_Huy) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_3_Khánh) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_T_Huy) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_Bình) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_3_Đức) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_3_Oanh) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_Cường) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_Mindy) ON CONFLICT DO NOTHING;

  -- Tie #13: Đội 4 vs Đội 5
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_4 AND team_b_id = v_team_5) OR (team_a_id = v_team_5 AND team_b_id = v_team_4)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 4 vs Đội 5', 13, v_team_4, v_team_5, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_4_Xuân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_4_Tuấn) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Quân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_5_Hào) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_4_Nhực) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_4_An) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Tâm) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_5_Nhu_Em) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_4_Sơn) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_4_Nhi) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Quân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_5_Hạnh) ON CONFLICT DO NOTHING;

  -- Tie #14: Đội 4 vs Đội 6
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_4 AND team_b_id = v_team_6) OR (team_a_id = v_team_6 AND team_b_id = v_team_4)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 4 vs Đội 6', 14, v_team_4, v_team_6, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_4_Xuân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_4_An) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_Cường) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_Triết) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_4_Sơn) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_4_Nhực) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_K_Đào) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_Bình) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_4_Tuấn) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_4_Nhi) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_T_Huy) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_Mindy) ON CONFLICT DO NOTHING;

  -- Tie #15: Đội 5 vs Đội 6
  SELECT id INTO v_tie_id FROM public.ties WHERE tournament_id = v_tourney_id AND group_id = v_group_id AND ((team_a_id = v_team_5 AND team_b_id = v_team_6) OR (team_a_id = v_team_6 AND team_b_id = v_team_5)) LIMIT 1;
  IF v_tie_id IS NULL THEN
    INSERT INTO public.ties(tournament_id, stage, group_id, round_label, round_order, team_a_id, team_b_id, court)
    VALUES (v_tourney_id, 'group', v_group_id, 'Vòng bảng: Đội 5 vs Đội 6', 15, v_team_5, v_team_6, 'Sân 1, 2, 3')
    RETURNING id INTO v_tie_id;
  END IF;

  UPDATE public.rubbers SET court = 'Sân 1' WHERE tie_id = v_tie_id AND position = 1 RETURNING id INTO v_rub_1;
  UPDATE public.rubbers SET court = 'Sân 2' WHERE tie_id = v_tie_id AND position = 2 RETURNING id INTO v_rub_2;
  UPDATE public.rubbers SET court = 'Sân 3' WHERE tie_id = v_tie_id AND position = 3 RETURNING id INTO v_rub_3;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_5_Tâm) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'a', v_p_5_Quân) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_Cường) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_1, 'b', v_p_6_Triết) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_5_Hào) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'a', v_p_5_Nhu_Em) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_K_Đào) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_2, 'b', v_p_6_Bình) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_5_Tâm) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'a', v_p_5_Hồng) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_T_Huy) ON CONFLICT DO NOTHING;
  INSERT INTO public.rubber_players(tournament_id, rubber_id, side, player_id) VALUES (v_tourney_id, v_rub_3, 'b', v_p_6_Mindy) ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Đã seed thành công 6 đội, 36 vận động viên, 15 trận đồng đội và toàn bộ đội hình cho giải %!', v_tourney_id;
END $$;
